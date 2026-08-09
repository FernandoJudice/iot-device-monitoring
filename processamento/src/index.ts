import { env } from "./config/env.js";
import { createConsumer, listenMessage } from "./kafka/consumer.js";


const consumer = await createConsumer(env.KAFKA_INGESTION_TOPIC);

await listenMessage(consumer, async (message) => {
  console.log(`Received message: ${JSON.stringify(message)}`);
  // Process the message here
}).catch((error) => {
  console.error('Error starting Kafka consumer:', error);
});
