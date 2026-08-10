import mqtt, { type MqttClient } from 'mqtt';
import { env } from './env.js';

export type BatteryBankReading = {
	bancoId: string;
	siteId: string;
	timestamp: string;
	tensaoV: number;
	correnteA: number;
	temperaturaC: number;
	estadoCarga: number;
	modo: 'flutuacao' | 'descarga' | 'recarga';
};

export async function publishReading(reading: BatteryBankReading): Promise<void> {
	const client = await connect();

	try {
		const topic = `${env.mqttTopicPrefix}/${reading.siteId}/${reading.bancoId}`;

		await new Promise<void>((resolve, reject) => {
			client.publish(topic, JSON.stringify(reading), { qos: 1 }, (error) => {
				if (error) reject(error);
				else resolve();
			});
		});
	} finally {
		await client.endAsync();
	}
}

function connect(): Promise<MqttClient> {
	return new Promise((resolve, reject) => {
		const client = mqtt.connect(env.mqttUrl, { connectTimeout: 5_000, reconnectPeriod: 0 });
		client.once('connect', () => resolve(client));
		client.once('error', (error) => {
			client.end(true);
			reject(error);
		});
	});
}
