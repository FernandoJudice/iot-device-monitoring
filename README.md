# IoT Device Monitoring

Telemetry pipeline for battery banks: the banks publish to MQTT, an ingestion
service moves that into Kafka, a processing service applies alarm rules and
keeps the state of each bank, an API exposes all of that (REST + WebSocket) and a web
front-end consumes that API.

## How to run

### Infrastructure and backend services

```bash
docker compose up -d
docker compose logs -f simulador
```
The `api` comes up at `http://localhost:3000`.
The `web` platform comes up at `http://localhost:3001`.

## Testing

With the infrastructure online, from inside the /test folder

```bash
npm install
npm test
```

## Considerations

1. All fields in the banks' messages are required; missing information results in the entire message being discarded.
2. To keep consistency, identifiers are kept in Portuguese.
3. A bank can have multiple simultaneous alarms.
4. No structured logger for simplicity; console.log was used instead.
5. Only devices that have sent at least one message during their lifetime are considered offline.
6. A module-based approach was chosen instead of object orientation. Both are viable, but functions in modules tend to offer greater simplicity and ease of testing for the current scope.
7. Processing assumes messages may arrive out of order or be processed more than once, so persistence operations must be idempotent where necessary.

## Limitations

1. Several queries still don't use Redis as a caching layer.
2. Rate limiting was not implemented.
3. The JWT flow has no refresh token or token rotation.
4. WebSocket channels keep local state per instance.
5. Lifecycle management of producer and consumer connections is limited.
6. No specific retry or dead-letter queue strategies were implemented for message processing failures.
7. The API currently does not consume events from the readings topic and therefore does not update the voltage chart in real time.
8. Real-time updates are limited to the events used for alarms. The API does not consume events from the readings topic, so it does not update the voltage chart in real time, only the alarms.
9. MongoDB and Redis are shared between processing and the API, creating coupling through the persistence model.
10. Management of producer and consumer connections (disconnects, etc.) is limited or nonexistent.
11. The applications don't have a dedicated logging system.
12. No unit tests were written.
13. Sometimes kafka-init reports that it created the topics successfully, but the topics are still being initialized. As a result, a simple retry mechanism was added to the services, though it should be refactored into a more robust solution.

## Ingestion

Message validation is done using Zod. Zod is a popular tool with good TypeScript integration. The intent is to separate validation of the communication protocol from the ingestion logic, allowing new message formats to be added without changing the service's main flow. After validation, the message can be normalized to the internal format used by the rest of the application and then published to Kafka.

No specific topic partitioning strategy has been adopted yet. In a higher-volume deployment, it would be possible and eventually necessary to evaluate using keys such as siteId or bancoId to distribute the load across partitions.

The ingestion structure was designed so that different protocols can be added through specific validators and transformers. This way, the service can receive different formats at the edge without propagating that complexity to the following stages of the architecture.

## Processing

kafka-js was chosen for the library's popularity. On npmjs.com it has over 3 million weekly downloads, while the next option, node-rdkafka, has a fraction of the usage. However, the KafkaJS used in the project does not implement Kafka Streams. For that reason, it wasn't possible to directly use stream processing features to maintain the state required by the alarm rules.

Alarm rules are stateful in that they can't be evaluated from a single message alone. Most of them require understanding the logic across a sequence of messages in order to derive the alarm. Given that, there are a few options:

The first option, Kafka Streams, would allow aggregations and filters across the entire topic stream. However, these tools are not available, to this author's knowledge, in the Kafka libraries for Node.js.

An alternative would be to keep all state in memory on the processing server itself. This approach would be simple, but would make behavior dependent on the service instance that received the message. In a horizontally scaled architecture, two consecutive messages could arrive at different instances, and each would have only a partial view of the state — making this approach unviable. Another possibility would be to reconstruct the state by replaying the topic's previous messages. While conceptually workable, this approach would have a growing cost as the message volume increases.

For that reason, only the metadata needed for the rules is persisted in Redis. This solution keeps state shared across instances without requiring recurring reads of the entire Kafka history, at an implementation cost appropriate for the scope. For the current scenario, Redis offered the best balance between simplicity and functionality.

The alert system was structured in a modular way. Rules follow a common interface, allowing different rule sets to be added or combined for different clients and scenarios without changing the main processing flow. The trade-off is that some rules are not pure functions, since they depend on information produced by previous messages.

Critical rule parameters were defined as environment variables. This way, values such as thresholds can be adjusted without modifying the application code, making configuration changes in production easier.

Alerts were also persisted in their own collection, even though this isn't a strict requirement and isn't strictly necessary for processing.

Not all alarms have a message as their trigger. The offline-bank state, for example, is determined by the absence of new messages. For that reason, a periodic routine was added that checks the last known state of the devices. This routine runs separately from the message-consumption flow.

One thing worth noting is that the detail screen shows a chart with the bank's readings over time. Within the project's scope, only an alarm event updates this screen via WebSocket. One possibility is to update the measurement chart every N readings. To do that, the API would need to consume the telemetria.leituras topic and periodically push the event to the web.

## API

For the current scope, the number of persistence operations is small enough that direct database access is simple. Because of that, no ORM was used.

It was considered that identifying the user's contracts isn't sensitive information and can therefore be present in the access token. This avoids an extra query just to obtain that information.

Due to time constraints, the authentication flow uses only access tokens, without refresh tokens or token rotation. In a production application, using refresh tokens would allow shortening access token lifetimes and increasing security, preventing a session from being hijacked.

The API also has some state needs, mainly related to alerts. To avoid that state being limited to a single instance's memory, Redis was used as shared storage. Alerts were organized using hset structures in Redis. While functional, this structure turned out to be not very intuitive and at times inconsistent — an area for improvement.

WebSocket connections keep state in memory in the API instance. This approach is sufficient while there's only one replica, but it presents a limitation once the service is scaled horizontally.

## Web

shadcn was used as the base for the design system due to its good compatibility with Next.js and the ability to keep components close to the application code. This approach allows reusing components without introducing an overly rigid dependency on a complete visual library.
