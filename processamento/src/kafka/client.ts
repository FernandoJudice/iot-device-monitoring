import { Kafka } from 'kafkajs';
import { env } from '../config/env.js';

export const kafkaClient = new Kafka({
  clientId: 'processor-service',
  brokers: [env.KAFKA_BROKER],
});
