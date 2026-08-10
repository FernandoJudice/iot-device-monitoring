export const env = {
	mqttUrl: process.env.TEST_MQTT_URL ?? 'mqtt://localhost:1883',
	mqttTopicPrefix: process.env.TEST_MQTT_TOPIC_PREFIX ?? 'moura/telemetria',
	mongoUri: process.env.TEST_MONGODB_URI ?? 'mongodb://localhost:27017/moura',
	redisUrl: process.env.TEST_REDIS_URL ?? 'redis://localhost:6379',
	apiUrl: process.env.TEST_API_URL ?? 'http://localhost:3000',

	authEmail: process.env.TEST_AUTH_EMAIL ?? 'ana.souza@exemplo.com',
	authPassword: process.env.TEST_AUTH_PASSWORD ?? 'senha123',
};
