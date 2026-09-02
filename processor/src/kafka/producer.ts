import type { Producer } from "kafkajs";
import { kafkaClient } from "./client.js";

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

export async function createProducer() {
	const producer = kafkaClient.producer();
	try {
		await producer.connect();
		console.log('Kafka producer connected');

		signalTraps.forEach(type => {
			process.on(type, async () => {
				try {
					await producer.disconnect()
				} finally {
					process.kill(process.pid, type)
				}
			})
		})

		return producer;

	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error connecting to Kafka producer: ${error.message}`);
		}
		throw new Error('Unknown error occurred while connecting to Kafka producer');
	}
}

export async function sendMessageArray<T>(producer: Producer, topic: string, messages: T[] ) {
	const payload = messages.map((message) => ({
		value: JSON.stringify(message) 
	}))
	try {
		await producer.send({
			topic,
			messages: payload,
		});
		console.log(`${payload.length} Message sent to Kafka topic ${topic}:`);
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error sending message to Kafka: ${error.message}`);
		}
		console.log('Unknown error occurred while sending message to Kafka');
	}
}