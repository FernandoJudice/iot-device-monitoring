import mqtt from "mqtt";
import type z from "zod";
import { fromZodError } from "zod-validation-error";

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

export function startMqttClient(broker: string, topic: string) {

	const client = mqtt.connect(broker);

	client.on("connect", () => {
		client.subscribe(`${topic}/#`, (err) => {
			if (!err) {
			console.log(`MQTT Successfully connected to ${topic}`);
			}
		});
	});

	signalTraps.forEach(type => {
		process.on(type, async () => {
			await client.end()
		})
	})

	return client;
}

export function setValidateAndRedirect<T>(
	client: mqtt.MqttClient, 
	schema: z.ZodSchema<T>, 
	callback: (message: T) => void) {
	client.on("message", (_topic, message) => {
		const parsedData = schema.safeParse(JSON.parse(message.toString()))
		if (parsedData.success) {
			callback(parsedData.data)
		} else {
			console.log(fromZodError(parsedData.error))
		}
	});
}