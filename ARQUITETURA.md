# Arquitetura

Considerando que cada contrato possui consideravelmente mais dispositivos do que usuários, e cada dispositivo possui uma cadência regular de mensagem, o sistema está mais orientado a *write-heavy* do que *read-heavy*. Dessa forma, a demanda cresce desigual entre os serviços. 

A ingestão e o processamento serão os pontos mais demandados. Processamento tende a ter uma demanda computacional mais intença pela natureza de avaliar múltiplos alarmes e a interação com bancos de dados. Felizmente, ambos services possuem fronteiras bem definidas e capacidade de escalar horizontalmente.

Para a ingestão, a divisão em tópicos permite organizar as intâncias de forma natural. As instâncias podem escutar um tópico ou subtópico específico. "Hot topics" podem ser compensados com uma segunda divisão quanto ao id do dispositivo.

Analogamente, o kafka permite a separação de um tópico em partições quanto uma chave. É possível separar esteiras quanto o siteId ou bancoId, o que permite processamento em paralelo porém ordenado das messagens, sem risco de 'racing conditions' ou da mesma messagem ser consumida simultaneamente por múltiplos consumidores (kafka organiza isso pelo consumer group). Porém é importante notar que nem todo alerta utiliza o recebimento de mensagem como gatilho. Alertas como banco offline funciona melhor como uma rotina periódica. Assim, uma melhoria seria ter worker dedicados para esse tipo de rotina em separado aos consumidores do kafka. No momento, ambos rodam dentro da mesma instância do processamento.

A Api é o serviço com a fronteira mais difusa. Alguns problemas surgem disso. Primeiramente, o mongoDB passa a ser um recurso compartilhado entre os serviços, o que pode limitar o acesso de um dos lados ao banco. Em momentos de pico de escrita, por exemplo, a api pode apresentar dificuldade em conseguir conexão com o banco. O segundo problema vem dos dois sistemas precisam compartilhar a estrutura das collections e dos documentos. Caso um dos services precise mudar esse contrato, a mudança deverá ser refletida em ambos.

Uma forma de abordar o problema é separar um banco para leitura e outro para escrita. No qual o banco de leitura seria sincronizado periodicamente. Essa abordagem possui a vantagem de separar o uso do recurso, porém tem alguns efeitos colaterais como um possível atraso na informação da api. Também não resolve o problema do contrato compartilhado entre os sistemas. Uma outra possibilidade está em criar um servido dedicado a persistir e expor os dados entre o processamento e a api. Possui a vantagem de abstrair o mongoDb caso o sistema precise alterar a tecnologia. Porém requer manter um serviço adicional

A solução aparentemente mais adequada, considerando a arquitetura centrada no kafka, seria utilizar os eventos como fonte de verdade. A api utilizaria um componente próprio para manter o histórico da aplicação. Em caso de queda do serviço, o histórico poderia ser reconstruído a partir da esteira do kafka. A longevidade dos eventos nos tópicos teria de ser ajustado para sempre conter um histórico razoável da aplicação. Um serviço dedicado monitoraria os tópicos relevantes e persistiria o dados no banco de dados. A desvantagem é a duplicidade da informação e possível problema de sincronia entre os dados, o que teria que ser compensado.

Um outro ponto relevante é que a arquitetura atual isola o tópico telemetria.leituras somente entre a ingestão e o processamento. Todavia, as informações de leitura são pertinente para outros serviços. A exemplo da API que demonstra o gráfico de tensão poderia consumir desse tópico para atualizar o gráfico dinâmicamente a cada N leituras. Devido a isso, com a evolução do sistema, é esperado que outros serviços além do processamento consuma do tópico leituras.

## WebSocket com várias réplicas

O estado das conexões WebSocket atualmente é mantido em memória pela instância da API. Essa abordagem evidentemente depende do estado da instância e não escala para múltiplas réplicas, pois outras instâncias não tem conhecimento do que está presente nas outras. O load balancer resolve a distribuição inicial das conexões, mas não resolve a comunicação entre as réplicas.

Uma forma de abordar esse problema seria utilizar um canal de comunicação compartilhado entre as instâncias da API. Nesse caso, a instância que consumir o evento do Kafka publicaria a informação nesse canal, e cada réplica encaminharia o evento apenas para os clientes conectados localmente. Como o Redis já é uma dependência do sistema, o Redis Pub/Sub seria uma alternativa natural para essa comunicação.

## Desenho na AWS

A porta de entrada da borda seria dada a partir do IoT Core. Esse componente é dedicado a lidar com grandes frotas de equipamento publicando em tópicos MQTT. A AWS oferece um componente kafka na forma do MSK. Esse serviço tem compatibilidade com outros componentes AWS e permite que atuem como produtores e consumidores.

Para os consumidores e produtores, a depender da complexidade e demanda computacional, pode optar-se por AWS lambda ou ECS / EC2. Um serviço pequeno como é o caso atual da ingestão pode ser descrito em lambda que recebe o gatilho do IoT, faz o parse dos dados e publica para o MSK. Em contrapartida, unidades como processamento e api podem utilizar componentes computacionais mais robustos como ECS e EC2.

Para a API, pode-se utilizar um Auto Scaling Group atrás de um Application Load Balancer. O ALB seria responsável pela distribuição das requisições entre as réplicas, terminação de TLS e health checks. Os endpoints REST e as conexões WebSocket poderiam utilizar target groups distintos, mantendo a distribuição das duas formas de comunicação sob a mesma camada de entrada.

Para persistência, pode-se utilizar serviços gerenciados da AWS ou serviços compatíveis, como DocumentDB ou MongoDB Atlas para os documentos e ElastiCache para o Redis. Dessa forma, a responsabilidade por disponibilidade, replicação e failover dos componentes de infraestrutura deixa de fazer parte dos serviços da aplicação, permitindo concentrar os esforços no processamento e nas regras de negócio.

Para observabilidade, o CloudWatch poderia centralizar tanto métricas de infraestrutura quanto métricas específicas da aplicação, como quantidade de mensagens processadas por segundo, lag dos consumer groups e quantidade de alertas abertos. Essas métricas poderiam alimentar políticas de Auto Scaling e alarmes enviados através do SNS. A mesma infraestrutura poderia centralizar os logs dos serviços, substituindo o uso de console.log por logs estruturados e agregáveis.

Como versionamento, seria utilizado uma ferramenta de infraestrutura como código, tal qual o terraform. Isso permite gerenciar as modificações na infraestrutura, construir e destruir componentes de forma prática e, mais importante, replicável e homogênea. 

## CI/CD e o que barra o merge

Para o pipeline de CI/CD, repositórios de código tipicamente possuem ferramentas para lidar com o CI. O GitHub Actions, ou Gitlab CI, pode executar automaticamente as etapas de validação do código, como instalação das dependências, lint, testes unitários, testes e build das aplicações. Os testes seriam configurados como status checks obrigatórios, bloqueando automaticamente o merge do Pull Request caso alguma dessas etapas falhe. Após a validação, as imagens Docker poderiam ser construídas e publicadas em um registry da AWS, como o ECR, e então utilizadas para atualizar os serviços em ECS ou EC2.

Para a entrega, o pipeline poderia ser integrado aos serviços da AWS, utilizando as credenciais adequadas por meio de IAM Roles os serviços de secrets. A partir de uma alteração na branch principal ou branch desejada, uma execução bem-sucedida do pipeline poderia gerar uma nova versão da imagem, publicá-la no ECR e iniciar o deployment da nova versão. O ambiente poderia ainda possuir etapas distintas para homologação e produção, com aprovação manual antes da publicação em produção.

A versão anterior pode ser mantida no registry. O cloudwatch faria o monitoramento da aplicação e caso alguma métrica ultrapasse um determinado limiar, como número de erros/tempo, o sistema reverte automaticamente para a versão estável anterior.

Como alternativa ao GitHub Actions, poderia ser utilizado o Jenkins como servidor de CI/CD. Nesse caso, o Jenkins seria responsável por executar as etapas de build, testes e deployment, mantendo a integração com os mesmos serviços da AWS, como ECR e ECS. A principal diferença estaria na infraestrutura adicional necessária para manter e administrar o próprio Jenkins, enquanto o GitHub Actions possui uma integração mais direta com o repositório já utilizado pelo projeto.

## Diagrama

```mermaid
flowchart LR
    D[50k bancos] -->|MQTT| MB[Cluster MQTT / IoT Core]
    MB --> I1[ingestao (1..N)]
    I1 -->|producer, chave=bancoId| K[(MSK - telemetria.leituras)]

    K --> P1[processamento (1..N)]
    P1 <--> R[(Redis - estado por banco)]
    P1 --> M[(Mongo - leituras + alertas)]
    CRON[worker de alarme periodico] <--> R
    P1 -->|producer| A[(MSK - alertas.eventos)]

    A --> API1[api REST (1..N)]
    A --> API2[api WebSocket (1..N)]
    API1 <--> R
    API2 <--> RP[Redis Pub/Sub]

    API1 --> WEB[web]
    API2 -.push.-> WEB
    M -.arquivamento frio.-> S3[(S3)]
```
