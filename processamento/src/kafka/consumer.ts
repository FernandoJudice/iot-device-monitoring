import type { Consumer } from "kafkajs";
import { kafkaClient } from "./client.js";

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

export async function createConsumer(topic: string) {
	const consumer = kafkaClient.consumer({groupId: 'processor-group'});
	try {
		await consumer.connect();
		await consumer.subscribe({ topic: topic });
		console.log('Kafka consumer connected');

		signalTraps.forEach(type => {
			process.on(type, async () => {
				try {
					await consumer.disconnect()
				} finally {
					process.kill(process.pid, type)
				}
			})
		})

		return consumer;

	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error connecting to Kafka producer: ${error.message}`);
		}
		throw new Error('Unknown error occurred while connecting to Kafka producer');
	}
}

export async function listenMessage<T>(consumer: Consumer, callback: (message: T) => Promise<void>) {
	await consumer.run({
			eachMessage: async ({ message }) => {
				// console.log(`Received message: ${message.value?.toString()}`);
				const data = JSON.parse(message.value?.toString() || '{}') as T;
				if (!data) {
					console.error('Received empty message');
					return;
				}
				await callback(data);
			},
		}).catch(e => console.error(`Failed to listen to messages on consumer's topic: ${e.message}`, e))
}