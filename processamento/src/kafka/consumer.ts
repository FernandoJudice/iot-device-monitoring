import { env } from "../config/env.js";
import { kafkaClient } from "./client.js";

const consumer = kafkaClient.consumer({groupId: 'processor-group'});

export async function startConsumer() {
	try {
		await consumer.connect();
		await consumer.subscribe({ topic: env.KAFKA_INGESTION_TOPIC });
		console.log('Kafka consumer connected');
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error connecting to Kafka consumer: ${error.message}`);
		}
		throw new Error('Unknown error occurred while connecting to Kafka consumer');
	}
}

export async function listenMessage<T>() {
	try {
		await consumer.run({
			eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
				console.log({
					key: message.key?.toString(),
					value: message.value?.toString(),
					headers: message.headers,
				})
			},
		})
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error sending message to Kafka: ${error.message}`);
		}
		console.log('Unknown error occurred while sending message to Kafka');
	}
}