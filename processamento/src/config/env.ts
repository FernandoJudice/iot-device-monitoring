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

export const env = {
  KAFKA_BROKER,
  KAFKA_INGESTION_TOPIC,
  KAFKA_ALARM_TOPIC,
};