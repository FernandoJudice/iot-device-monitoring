import { startConsumer, listenMessage } from "./kafka/consumer.js";

startConsumer()
.then(() => {
  console.log('Kafka consumer started');
  listenMessage();
}).catch((error) => {
  console.error('Error starting Kafka consumer:', error);
});
