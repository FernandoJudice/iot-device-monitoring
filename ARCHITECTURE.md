# Architecture

Considering that each contract has considerably more devices than users, and each device has a regular message cadence, the system is more write-heavy than read-heavy. As a result, demand grows unevenly across services.

Ingestion and processing will be the most heavily loaded points. Processing tends to have a more intense computational demand due to the nature of evaluating multiple alarms and interacting with databases. Fortunately, both services have well-defined boundaries and can scale horizontally.

For ingestion, splitting into topics allows instances to be organized naturally. Instances can listen to a specific topic or subtopic. "Hot topics" can be compensated for with a second split based on device id.

Similarly, Kafka allows a topic to be split into partitions by key. Streams can be separated by siteId or bancoId, which enables parallel but ordered processing of messages, without risk of race conditions or the same message being consumed simultaneously by multiple consumers (Kafka handles this through the consumer group). However, it's important to note that not every alert uses message receipt as its trigger. Alerts such as offline bank work better as a periodic routine. So an improvement would be to have dedicated workers for that kind of routine, separate from the Kafka consumers. Currently, both run within the same processing instance.

The API is the service with the fuzziest boundary. A few problems arise from that. First, MongoDB becomes a resource shared between services, which can limit one side's access to the database. During write spikes, for example, the API may have trouble getting a connection to the database. The second problem comes from both systems needing to share the structure of collections and documents. If one of the services needs to change that contract, the change has to be reflected in both.

One way to approach the problem is to separate a read database from a write database, where the read database would be synced periodically. This approach has the advantage of separating resource usage, but has side effects such as a possible delay in the API's information. It also doesn't solve the problem of the contract shared between the systems. Another possibility is to create a dedicated service to persist and expose data between processing and the API. It has the advantage of abstracting away MongoDB in case the system needs to change technology, but it requires maintaining an additional service.

The solution that seems most appropriate, given the Kafka-centered architecture, would be to use events as the source of truth. The API would use its own component to keep the application's history. If the service went down, the history could be rebuilt from the Kafka stream. Event retention on the topics would have to be adjusted to always contain a reasonable history of the application. A dedicated service would monitor the relevant topics and persist the data to the database. The downside is data duplication and possible synchronization issues between the data stores, which would have to be compensated for.

Another relevant point is that the current architecture isolates the telemetria.leituras topic solely between ingestion and processing. However, the reading data is relevant to other services. For example, the API that shows the voltage chart could consume from that topic to update the chart dynamically every N readings. Because of this, as the system evolves, other services besides processing are expected to consume from the readings topic.

## WebSocket with multiple replicas

WebSocket connection state is currently kept in memory by the API instance. This approach obviously depends on the instance's state and doesn't scale to multiple replicas, since other instances have no knowledge of what's present in the others. The load balancer handles initial connection distribution, but doesn't solve communication between replicas.

One way to approach this problem would be to use a communication channel shared between API instances. In that case, the instance that consumes the Kafka event would publish the information to that channel, and each replica would forward the event only to its locally connected clients. Since Redis is already a dependency of the system, Redis Pub/Sub would be a natural fit for this communication.

## AWS design

The edge entry point would be provided by IoT Core. This component is dedicated to handling large fleets of equipment publishing to MQTT topics. AWS offers a Kafka component in the form of MSK. This service is compatible with other AWS components and allows them to act as producers and consumers.

For consumers and producers, depending on complexity and computational demand, one could choose AWS Lambda or ECS/EC2. A small service like the current ingestion service could be described as a Lambda that receives the IoT trigger, parses the data, and publishes to MSK. On the other hand, units such as processing and the API could use more robust compute components like ECS and EC2.

For the API, an Auto Scaling Group behind an Application Load Balancer could be used. The ALB would be responsible for distributing requests across replicas, TLS termination, and health checks. REST endpoints and WebSocket connections could use separate target groups, keeping the two forms of communication under the same entry layer.

For persistence, AWS managed services or compatible services could be used, such as DocumentDB or MongoDB Atlas for documents and ElastiCache for Redis. This way, responsibility for availability, replication, and failover of the infrastructure components would no longer be part of the application services, allowing effort to focus on processing and business rules.

For observability, CloudWatch could centralize both infrastructure metrics and application-specific metrics, such as the number of messages processed per second, consumer group lag, and the number of open alerts. These metrics could feed Auto Scaling policies and alarms sent through SNS. The same infrastructure could centralize service logs, replacing console.log with structured, aggregatable logs.

For versioning, an infrastructure-as-code tool such as Terraform would be used. This allows infrastructure changes to be managed, and components to be built and destroyed in a practical and, more importantly, repeatable and consistent way.

## CI/CD and what blocks the merge

For the CI/CD pipeline, code repositories typically have tools to handle CI. GitHub Actions, or GitLab CI, can automatically run code validation steps, such as installing dependencies, linting, unit tests, tests, and building the applications. Tests would be configured as required status checks, automatically blocking the Pull Request merge if any of these steps fail. After validation, Docker images could be built and published to an AWS registry, such as ECR, and then used to update the services on ECS or EC2.

For delivery, the pipeline could be integrated with AWS services, using proper credentials via IAM Roles and secrets services. Following a change to the main branch or the desired branch, a successful pipeline run could generate a new image version, publish it to ECR, and start deploying the new version. The environment could also have separate stages for staging and production, with manual approval before publishing to production.

The previous version can be kept in the registry. CloudWatch would monitor the application, and if any metric crosses a given threshold, such as number of errors/time, the system automatically rolls back to the previous stable version.

As an alternative to GitHub Actions, Jenkins could be used as the CI/CD server. In that case, Jenkins would be responsible for running the build, test, and deployment steps, while keeping integration with the same AWS services, such as ECR and ECS. The main difference would be the additional infrastructure needed to maintain and administer Jenkins itself, while GitHub Actions has more direct integration with the repository already used by the project.

## Diagram

```mermaid
flowchart LR
    D[50k banks] -->|MQTT| MB[MQTT Cluster / IoT Core]
    MB --> I1[ingestion (1..N)]
    I1 -->|producer, key=bancoId| K[(MSK - telemetria.leituras)]

    K --> P1[processing (1..N)]
    P1 <--> R[(Redis - per-bank state)]
    P1 --> M[(Mongo - readings + alerts)]
    CRON[periodic alarm worker] <--> R
    P1 -->|producer| A[(MSK - alertas.eventos)]

    A --> API1[REST api (1..N)]
    A --> API2[WebSocket api (1..N)]
    API1 <--> R
    API2 <--> RP[Redis Pub/Sub]

    API1 --> WEB[web]
    API2 -.push.-> WEB
    M -.cold archival.-> S3[(S3)]
```
