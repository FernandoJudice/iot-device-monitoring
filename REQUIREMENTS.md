## Starting it up

```bash
docker compose up -d
docker compose logs -f simulador
```

In about a minute everything is up and the simulator starts publishing.

| Service | Address from your machine | From another container |
|---|---|---|
| MQTT | `mqtt://localhost:1883` | `mqtt://mosquitto:1883` |
| MQTT over WebSocket | `ws://localhost:9001` | `ws://mosquitto:9001` |
| Kafka | `localhost:9092` | `kafka:29092` |
| MongoDB | `mongodb://localhost:27017/moura` | `mongodb://mongo:27017/moura` |
| Redis | `redis://localhost:6379` | `redis://redis:6379` |

To tear everything down and wipe the data: `docker compose down -v`.

### Kafka topics already created

The `kafka-init` service comes up alongside it and creates two topics for you to use:

| Topic | Partitions | Intended use |
|---|---|---|
| `telemetria.leituras` | 6 | The readings your ingestion service will publish |
| `alertas.eventos` | 3 | Alert-opened and alert-resolved events |

They arrive empty. Your application is what publishes to them.

## The telemetry

The simulator publishes readings for **40 battery banks** distributed across **12 sites**, every 5 seconds.

It publishes **only to MQTT**, on the topic `moura/telemetria/{siteId}/{bancoId}` — that's how field equipment behaves. Getting that data into Kafka is part of what you'll build.

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

`modo` can be `flutuacao` (float), `descarga` (discharge) or `recarga` (recharge).

Some banks have anomalous behavior programmed in — voltage degradation, overheating, discharge episodes, and one that simply stops responding. The anomalies appear in the first few minutes of the run. They're not documented here on purpose: part of the exercise is observing the data.

The simulator is deterministic. With the same seed (`SEMENTE=42`, the default), the same sequence of readings repeats on every run.

### Simulator variables

| Variable | Default | Purpose |
|---|---|---|
| `INTERVALO_MS` | `5000` | Interval between publications |
| `SEMENTE` | `42` | Generator seed |

## Seed data

MongoDB comes up already populated with users, contracts, sites and banks, in the `moura` database. The script is at `seed/01-dados-iniciais.js` and runs automatically the first time the container starts.

The same data is available in `seed/dados.json`, in case you'd rather load it through your own application or use a different data model. **You can adapt the schema however you like** — just keep the identifiers (`bancoId`, `siteId`, `contratoId`, emails) so we can navigate your solution.

### Users

All with the password `senha123`. The `senhaHash` field already comes with the matching bcrypt hash (cost 10, `$2b$` prefix).

If your library doesn't accept the `$2b$` prefix (some older .NET bcrypt versions only accept `$2a$`) or you prefer another algorithm, **generate the hashes yourself from `senha123`** and swap them into the seed. Don't waste time fighting this.

| Email | Role | Can see |
|---|---|---|
| `ana.souza@exemplo.com` | operator | all sites |
| `carlos.lima@exemplo.com` | operator | all sites |
| `ricardo@telenordeste.exemplo.com` | client | contract CT-1001, sites 0101 to 0106 |
| `juliana@dcsul.exemplo.com` | client | contract CT-1002, sites 0107 to 0112 |

## How time works in this environment

Three things that will save you confusion:

**History starts empty.** There's no preloaded reading in MongoDB — history builds up as the simulator runs. That's 40 readings every 5 seconds, or about 480 per minute. Leave the environment running while you develop and within a few minutes you'll have enough data for charts and pagination.

**Anomalies happen in the first few minutes.** They're counted from the moment the simulator container starts. If you restart the simulator, the timeline resets from zero — including a bank that had already stopped responding, which starts publishing again.

**Some rules require waiting.** A 10- or 15-minute condition takes 10 or 15 minutes of wall-clock time to happen. Practical suggestion: **make the thresholds and windows configurable via environment variable** in your application. Reduce them to seconds while developing, and restore the values from the brief before submitting. That's also a good design decision in its own right.

## Adding your application

Create your folders at the root (`ingestao/`, `processamento/`, `api/`, `web/`) and add the services to `docker-compose.yml`, using the internal names from the table above.

Two compose details that tend to bite:

- Kafka takes about a minute to become ready. Use `depends_on` with `condition: service_healthy` on your services that talk to it, the way the simulator does with MQTT — or implement reconnection with retry, which is the more robust option.
- The `kafka-init` service runs once, creates the topics, and exits. It's expected to show up as exited in the container listing.

In the end, `docker compose up` should bring everything up — infrastructure and your four services — with no manual step.

## Checking that everything is fine

```bash
# telemetry arriving on MQTT
docker exec -it mc-mosquitto mosquitto_sub -t 'moura/telemetria/#' -C 5

# topics created in Kafka
docker exec -it mc-kafka kafka-topics --bootstrap-server kafka:29092 --list

# what your ingestion is publishing to Kafka
docker exec -it mc-kafka kafka-console-consumer \
  --bootstrap-server kafka:29092 --topic telemetria.leituras --max-messages 5

# seed data in Mongo
docker exec -it mc-mongo mongosh moura --quiet --eval 'db.bancos.countDocuments()'
```
