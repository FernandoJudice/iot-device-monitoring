import { createProducer, sendMessageCb } from "./kafka/producer.js";
import { setValidateAndRedirect, startMqttClient } from "./mqtt/mqtt.js";
import { env } from "./config/env.js";
import { BatteryBankSchema, type TBatteryBank } from "./protocols/battery-bank.types.js";

const producer = await createProducer()
	.catch((error) => {
	console.error('Error starting Ingestion Service:', error);
	process.exit(1);
});

const mqttClient = startMqttClient(env.MQTT_BROKER, env.BATTERY_BANK_TOPIC);

setValidateAndRedirect(
	mqttClient, 
	BatteryBankSchema, 
	sendMessageCb<TBatteryBank>(producer, env.INGESTION_TOPIC)
);