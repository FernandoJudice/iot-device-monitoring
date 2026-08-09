const KAFKA_BROKER = process.env.KAFKA_BROKER

if (!KAFKA_BROKER) {
  throw new Error('KAFKA_BROKER environment variable is not defined');
}

const KAFKA_INGESTION_TOPIC = process.env.KAFKA_INGESTION_TOPIC

if (!KAFKA_INGESTION_TOPIC) {
  throw new Error('KAFKA_INGESTION_TOPIC environment variable is not defined');
}

const KAFKA_ALARM_TOPIC = process.env.KAFKA_ALARM_TOPIC

if (!KAFKA_ALARM_TOPIC) {
  throw new Error('KAFKA_ALARM_TOPIC environment variable is not defined');
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const REDIS_URL = process.env.REDIS_URL

if (!REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not defined');
}

export const env = {
  KAFKA_BROKER,
  KAFKA_INGESTION_TOPIC,
  KAFKA_ALARM_TOPIC,
  MONGODB_URI,
  REDIS_URL
};