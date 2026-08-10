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

const DISCHARGE_TIME_MIN = Number(process.env.DISCHARGE_TIME_MIN)

if (!DISCHARGE_TIME_MIN || Number.isNaN(DISCHARGE_TIME_MIN)) {
  throw new Error('DISCHARGE_TIME_MIN environment variable is not defined');
}


const OVERTEMP_C = Number(process.env.OVERTEMP_C)

if (!OVERTEMP_C || Number.isNaN(OVERTEMP_C)) {
  throw new Error('OVERTEMP_C environment variable is not defined');
}

const LOW_VOLTAGE_V = Number(process.env.LOW_VOLTAGE_V)

if (!LOW_VOLTAGE_V || Number.isNaN(LOW_VOLTAGE_V)) {
  throw new Error('LOW_VOLTAGE_V environment variable is not defined');
}

const OFFLINE_TIME_MIN = Number(process.env.OFFLINE_TIME_MIN)

if (!OFFLINE_TIME_MIN || Number.isNaN(OFFLINE_TIME_MIN)) {
  throw new Error('LOW_VOLTAGE_V environment variable is not defined');
}

export const env = {
  KAFKA_BROKER,
  KAFKA_INGESTION_TOPIC,
  KAFKA_ALARM_TOPIC,
  MONGODB_URI,
  REDIS_URL,
  DISCHARGE_TIME_MIN,
  OVERTEMP_C,
  LOW_VOLTAGE_V,
  OFFLINE_TIME_MIN
};