import { Kafka } from 'kafkajs';
import { env } from '../config/env.js';

const kafka = new Kafka({
  clientId: 'ingestion-service',
  brokers: [env.KAFKA_BROKER],
});

const producer = kafka.producer();

export async function startProducer() {
	try {
		await producer.connect();
		console.log('Kafka producer connected');
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error connecting to Kafka producer: ${error.message}`);
		}
		throw new Error('Unknown error occurred while connecting to Kafka producer');
	}
}

export async function sendMessage<T>(topic: string, message: T) {
	try {
		await producer.send({
			topic,
			messages: [{ value: JSON.stringify(message) }],
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log(`Error sending message to Kafka: ${error.message}`);
		}
		console.log('Unknown error occurred while sending message to Kafka');
	}
}