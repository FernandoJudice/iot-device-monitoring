import { startProducer } from "./kafka/kafka-client.js";
import { startMqttClient } from "./mqtt/mqtt.js";

startProducer()
.then(() => { 
	startMqttClient()
 })
.catch((error) => {
	console.error('Error starting Ingestion Service:', error);
	process.exit(1);
})