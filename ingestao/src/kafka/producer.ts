import { Kafka, type Producer } from 'kafkajs';
import { env } from '../config/env.js';

const kafka = new Kafka({
  clientId: 'ingestion-service',
  brokers: [env.KAFKA_BROKER],
});

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

export async function createProducer() {
	const producer = kafka.producer();
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

export function sendMessageCb<T>(producer: Producer, topic: string ) {
	return async (message: T) => {
		try {
			await producer.send({
				topic,
				messages: [{ value: JSON.stringify(message) }],
			});
			console.log(`Message sent to Kafka topic ${topic}:`, message);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error sending message to Kafka: ${error.message}`);
			}
			console.log('Unknown error occurred while sending message to Kafka');
		}
	}
}