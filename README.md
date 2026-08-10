# Moura Connect

Pipeline de telemetria para bancos de bateria: os bancos publicam em MQTT, um serviço de
ingestão leva isso para o Kafka, um serviço de processamento aplica regras de alarme e
mantém o estado de cada banco, uma API expõe tudo isso (REST + WebSocket) e um front-end
web consome essa API.

## Como rodar

### Infraestrutura e serviços de backend

```bash
docker compose up -d
docker compose logs -f simulador
```
A `api` sobe em `http://localhost:3000`.
A plataforma `web` sobe em `http://localhost:3001`.

## Teste 

Com a infraestrutura online, de dentro da pasta /test

```bash
npm install
npm test
```

## Considerações

1. Todas as variáveis na mensagem dos bancos são necessárias; informações faltantes resultam no descarte da mensagem inteira.
2. Para manter consistência, os identificadores serão mantidos em português.
3. Um banco pode possuir múltiplos alarmes simultaneamente.
4. Sem logger estruturado por simplicidade; foi utilizado console.log.
5. Só serão considerados desligados dispositivos que tenham enviado pelo menos uma mensagem durante sua vida útil.
6. Optou-se por uma abordagem focada em módulos em vez de orientação a objetos. Ambas são viáveis, porém funções em módulos tendem a oferecer maior simplicidade e facilidade de teste para o escopo atual.
7. O processamento assume que mensagens podem chegar fora de ordem ou ser processadas mais de uma vez, devendo as operações de persistência ser idempotentes quando necessário.

## Limitações

1. Várias queries ainda não utilizam Redis como camada de cache.
2. Não foi implementado rate limiting.
3. O fluxo de JWT não possui refresh token ou rotação de tokens.
4. Os canais WebSocket mantêm estado local da instância.
5. O gerenciamento do ciclo de vida das conexões de producers e consumers é limitado.
6. Não foram implementadas estratégias específicas de retry e dead-letter queue para falhas no processamento de mensagens.
7. A API não consome atualmente os eventos do tópico de leituras e, portanto, não atualiza o gráfico de tensão em tempo real.
8. A atualização em tempo real está limitada aos eventos utilizados para os alarmes. Api não consome eventos do tópico leitura, assim, não atualiza em tempo real o gráfico de tensão, apenas os alarmes
9. O MongoDB e Redis é compartilhado entre processamento e API, criando acoplamento através do modelo de persistência.
10. Gerenciamento da conexão dos producers e consumers (disconnects, etc) é limitado ou inexistente
11. As aplicações não possuem sistema de logs dedicado
12. Não foram elaborados testes unitários
13. Por vezes, kafka-init retorna que criou os tópicos com sucesso, porém os tópicos ainda estão sendo inicializados. Como resultado, um sistema simples de retry foi adicionado aos serviços, porém devem ser refatorados para uma solução mais robusta 

## ingestao

A validação das mensagens é realizada utilizando Zod. Zod é uma ferramenta popular com boa integração com typescript. A intenção é separar a validação do protocolo de comunicação da lógica de ingestão, permitindo adicionar novos formatos de mensagem sem alterar o fluxo principal do serviço. Após a validação, a mensagem pode ser normalizada para o formato interno utilizado pelo restante da aplicação e então publicada no Kafka.

Ainda não foi adotada uma estratégia específica de particionamento dos tópicos. Em uma implantação com maior volume, seria possível e eventualmente necessário avaliar a utilização de chaves como siteId ou bancoId para distribuir a carga entre partições.

A estrutura da ingestão foi pensada para que diferentes protocolos possam ser adicionados através de validadores e transformadores específicos. Dessa forma, o serviço consegue receber diferentes formatos na borda sem propagar essa complexidade para as etapas seguintes da arquitetura.

## processamento

Optou-se por kafka-js pela popularidade da biblioteca. Em npmjs.com ela consta com mais de 3 mihões de downloads semanais. Ao passo que a opção seguinte Node-rdkafka possui uma fração do uso. Todavia, O KafkaJS utilizado no projeto não implementa Kafka Streams. Por esse motivo, não foi possível utilizar diretamente os recursos de processamento de streams para manter o estado necessário às regras de alarme.

As regras de alarme são Stateful ao considerar que não podem ser avaliadas somente com uma mensagem. A maioria requer entender a lógica entre uma sequência de mensagens para poder derivar o alarme. Frente a isso, há algumas opções:

A primeira opção, o kafka streams, permiteria realizar agregações e filtros sob toda a esteira do tópico. Todavia, estas ferramentas não estão disponíveis, no que é de conhecimento deste autor, nas bibliotecas de kafka para nodejs.

Uma alternativa seria manter todo o estado em memória no próprio servidor de processamento. Essa abordagem seria simples, porém deixaria o comportamento dependente da instância do serviço que recebeu a mensagem. Em uma arquitetura horizontalmente escalada, duas mensagens consecutivas poderiam chegar em instâncias diferentes e cada uma teria apenas uma visão parcial do estado. Sendo assim inviável. Outra possibilidade seria reconstruir o estado percorrendo as mensagens anteriores do tópico. Apesar de funcionar conceitualmente, essa abordagem teria um custo crescente conforme o volume de mensagens aumentasse. 

Por isso, optou-se por persistir no Redis apenas os metadados necessários para as regras. Essa solução mantém o estado compartilhado entre as instâncias sem exigir a leitura recorrente de todo o histórico do Kafka, apresentando um custo de implementação adequado ao escopo. Para o cenário atual, o Redis apresentou uma relação mais adequada entre simplicidade e funcionalidade.

O sistema de alertas foi estruturado de forma modular. As regras seguem uma interface comum, permitindo adicionar ou combinar diferentes conjuntos de regras para clientes e cenários distintos sem alterar o fluxo principal do processamento. O contraponto é que algumas regras não são funções puras, pois dependem de informações produzidas por mensagens anteriores.

Os parâmetros críticos das regras foram definidos como variáveis de ambiente. Dessa forma, valores como limiares podem ser ajustados sem modificar o código da aplicação, facilitando alterações de configuração em produção.

Optou-se também por persistir os alertas em uma coleção própria, apesar de não ser um requesito e de isso não ser estritamente necessário para o processamento.

Nem todos os alarmes possuem uma mensagem como gatilho. O estado de banco offline, por exemplo, é determinado pela ausência de novas mensagens. Por esse motivo, foi adicionada uma rotina periódica que verifica o último estado conhecido dos dispositivos. Essa rotina é executada separadamente do fluxo de consumo das mensagens.

Um ponto percebido é que, para a tela de detalhamento, é exibido um gráfico com as leituras sobre o tempo do banco. Como escopo do projeto, apenas um evento de alarme atualiza essa tela conforme websocket. Uma possibilidade é atualizar a cada N leituras o gráfico da medida. Para isso, seria necessário que a API consumisse o tópico telemetria.leituras e periodicamente empurrasse o evento para o web.

## API

Para o escopo atual, a quantidade de operações de persistência é suficientemente pequena para que o acesso direto ao banco seja simples. Devido a isso, não foi utilizado um ORM. 

Considerou-se que a identificação dos contratos do usuário não representa uma informação sensível e, portanto, pode estar presente no access token. Isso evita realizar uma consulta adicional apenas para obter essa informação.

Por limitações de tempo, o fluxo de autenticação utiliza apenas access tokens, sem refresh token ou rotação de tokens. Em uma aplicação de produção, a utilização de refresh tokens permitiria reduzir a duração dos access tokens e aumentar a segurança, evitando que uma sessão seja sequestrada.

A API também possui algumas necessidades de estado, principalmente relacionadas aos alertas. Para evitar que esse estado fique limitado à memória de uma única instância, o Redis foi utilizado como armazenamento compartilhado. Os alertas foram organizados utilizando estruturas de hset no Redis. Apesar de funcional, essa estrutura se mostrou pouco intuitiva, e por vezes fora de padrão. Assim sendo um ponto de melhoria.

As conexões WebSocket possuem estado mantido em memória pela instância da API. Essa abordagem é suficiente enquanto existe apenas uma réplica, porém apresenta uma limitação quando o serviço passa a ser escalado horizontalmente.

## Web

Foi utilizado shadcn como base para o design system devido à sua boa compatibilidade com Next.js e à possibilidade de manter os componentes próximos ao código da aplicação. Essa abordagem permite reutilizar componentes sem introduzir uma dependência excessivamente rígida de uma biblioteca visual completa.
