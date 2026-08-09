import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { redisClient } from "./config/redis.js";
import { createConsumer, listenMessage } from "./kafka/consumer.js";
import { processMessage } from "./message/message.controller.js";

await connectToDatabase();
await redisClient.connect();

const consumer = await createConsumer(env.KAFKA_INGESTION_TOPIC);

await listenMessage(
	consumer, 
	processMessage
);
