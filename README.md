# Notes

## Considerações

1. Todas as variáveis na mensagem dos bancos são necessária (informações faltantes resultam no descarte da mensagem inteira)

## ingestao

validação utilizando Zod
Considerando kafka um singleton, um único producer
Ainda não foi considerado partições no kafka

## processamento

# Repositório base — Moura Connect

Ambiente pronto para você começar o case sem gastar tempo com infraestrutura. Aqui está tudo que você precisa: os brokers, os bancos de dados, o simulador de telemetria e uma carga inicial de dados.

## Subindo

```bash
docker compose up -d
docker compose logs -f simulador
```

Em cerca de um minuto tudo está no ar e o simulador começa a publicar.

| Serviço | Endereço a partir da sua máquina | A partir de outro container |
|---|---|---|
| MQTT | `mqtt://localhost:1883` | `mqtt://mosquitto:1883` |
| MQTT sobre WebSocket | `ws://localhost:9001` | `ws://mosquitto:9001` |
| Kafka | `localhost:9092` | `kafka:29092` |
| MongoDB | `mongodb://localhost:27017/moura` | `mongodb://mongo:27017/moura` |
| Redis | `redis://localhost:6379` | `redis://redis:6379` |

Para derrubar tudo e limpar os dados: `docker compose down -v`.

### Tópicos Kafka já criados

O serviço `kafka-init` sobe junto e cria dois tópicos para você usar:

| Tópico | Partições | Uso previsto |
|---|---|---|
| `telemetria.leituras` | 6 | As leituras que seu serviço de ingestão vai publicar |
| `alertas.eventos` | 3 | Os eventos de alerta aberto e resolvido |

Eles chegam vazios. Quem publica neles é a sua aplicação.

## A telemetria

O simulador publica leituras de **40 bancos de baterias** distribuídos em **12 sites**, a cada 5 segundos.

Ele publica **apenas no MQTT**, no tópico `moura/telemetria/{siteId}/{bancoId}` — é assim que equipamento em campo se comporta. Levar esse dado para dentro do Kafka faz parte do que você vai construir.

```json
{
  "bancoId": "BR-PE-0101-A",
  "siteId": "SITE-0101",
  "timestamp": "2026-07-30T14:03:11Z",
  "tensaoV": 52.73,
  "correnteA": -0.18,
  "temperaturaC": 30.4,
  "estadoCarga": 0.968,
  "modo": "flutuacao"
}
```

`modo` pode ser `flutuacao`, `descarga` ou `recarga`.

Alguns bancos têm comportamento anômalo programado — degradação de tensão, sobreaquecimento, episódios de descarga e um que simplesmente para de responder. As anomalias aparecem nos primeiros minutos de execução. Não estão documentadas aqui de propósito: parte do exercício é observar os dados.

O simulador é determinístico. Com a mesma semente (`SEMENTE=42`, o padrão), a mesma sequência de leituras se repete a cada execução.

### Variáveis do simulador

| Variável | Padrão | Para quê |
|---|---|---|
| `INTERVALO_MS` | `5000` | Intervalo entre publicações |
| `SEMENTE` | `42` | Semente do gerador |

## Dados iniciais

O MongoDB já sobe populado com usuários, contratos, sites e bancos, no banco `moura`. O script está em `seed/01-dados-iniciais.js` e roda automaticamente na primeira subida do container.

Se você mexer no volume e quiser recarregar: `docker compose down -v && docker compose up -d`.

Os mesmos dados estão em `seed/dados.json`, caso você prefira carregá-los pela sua própria aplicação ou usar outro modelo de dados. **Você pode adaptar o schema como quiser** — só mantenha os identificadores (`bancoId`, `siteId`, `contratoId`, e-mails) para que a gente consiga navegar na sua solução.

### Usuários

Todos com a senha `senha123`. O campo `senhaHash` já vem com o hash bcrypt correspondente (custo 10, prefixo `$2b$`).

Se a sua biblioteca não aceitar o prefixo `$2b$` (algumas versões antigas de bcrypt em .NET só aceitam `$2a$`) ou se você preferir outro algoritmo, **gere os hashes você mesmo a partir de `senha123`** e substitua no seed. Não perca tempo brigando com isso.

| E-mail | Perfil | Enxerga |
|---|---|---|
| `ana.souza@exemplo.com` | operador | todos os sites |
| `carlos.lima@exemplo.com` | operador | todos os sites |
| `ricardo@telenordeste.exemplo.com` | cliente | contrato CT-1001, sites 0101 a 0106 |
| `juliana@dcsul.exemplo.com` | cliente | contrato CT-1002, sites 0107 a 0112 |

## Como o tempo funciona neste ambiente

Três coisas que vão te poupar confusão:

**O histórico começa vazio.** Não existe leitura pré-carregada no MongoDB — o histórico se forma conforme o simulador roda. São 40 leituras a cada 5 segundos, ou seja, cerca de 480 por minuto. Deixe o ambiente ligado enquanto desenvolve e em poucos minutos você tem dado suficiente para gráfico e paginação.

**As anomalias acontecem nos primeiros minutos.** Elas são contadas a partir do momento em que o container do simulador sobe. Se você reiniciar o simulador, a linha do tempo recomeça do zero — inclusive um banco que já tinha parado de responder volta a publicar.

**Algumas regras exigem esperar.** Uma condição de 10 ou 15 minutos leva 10 ou 15 minutos de relógio para acontecer. Sugestão prática: **deixe os limiares e as janelas configuráveis por variável de ambiente** na sua aplicação. Você reduz para segundos enquanto desenvolve, e devolve aos valores do enunciado antes de entregar. Isso também é uma boa decisão de projeto por si só.

## Adicionando sua aplicação

Crie suas pastas na raiz (`ingestao/`, `processamento/`, `api/`, `web/`) e adicione os serviços ao `docker-compose.yml`, usando os nomes internos da tabela acima.

Dois detalhes de compose que costumam morder:

- O Kafka demora cerca de um minuto para ficar pronto. Use `depends_on` com `condition: service_healthy` nos seus serviços que falam com ele, como o simulador faz com o MQTT — ou implemente reconexão com retry, que é a opção mais robusta.
- O serviço `kafka-init` roda uma vez, cria os tópicos e encerra. É esperado que ele apareça como finalizado na listagem dos containers.

Ao final, `docker compose up` deve subir tudo — infraestrutura e os seus quatro serviços — sem passo manual.

## Conferindo se está tudo certo

```bash
# telemetria chegando no MQTT
docker exec -it mc-mosquitto mosquitto_sub -t 'moura/telemetria/#' -C 5

# topicos criados no Kafka
docker exec -it mc-kafka kafka-topics --bootstrap-server kafka:29092 --list

# o que a sua ingestao esta publicando no Kafka
docker exec -it mc-kafka kafka-console-consumer \
  --bootstrap-server kafka:29092 --topic telemetria.leituras --max-messages 5

# dados iniciais no Mongo
docker exec -it mc-mongo mongosh moura --quiet --eval 'db.bancos.countDocuments()'
```
