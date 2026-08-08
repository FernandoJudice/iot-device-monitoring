import mqtt from "mqtt";
import { env } from "../config/env.js";
import { sendMessage } from "../kafka/kafka-client.js";
import { BatteryBankSchema, type TBatteryBank } from "../protocols/battery-bank.types.js";
import { validateSchema } from "../protocols/validate-protocol.js";

export function startMqttClient() {

	const client = mqtt.connect(env.MQTT_BROKER);

	client.on("connect", () => {
		client.subscribe(`${env.BATTERY_BANK_TOPIC}/#`, (err) => {
			if (!err) {
			console.log(`MQTT Successfully connected to ${env.BATTERY_BANK_TOPIC}`);
			}
		});
	});

	client.on("message", (topic, message) => {
		const data = validateSchema(BatteryBankSchema, JSON.parse(message.toString()))
		if (data) {
			sendMessage<TBatteryBank>(env.KAFKA_TOPIC, data)
		}
	});
}