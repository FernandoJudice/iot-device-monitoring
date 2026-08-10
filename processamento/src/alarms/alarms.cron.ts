import type { Producer } from "kafkajs";
import { ChronAlarms } from "./alarms.config.js";
import { applyAlarms } from "./alarms.service.js";
import { env } from "../config/env.js";
import { sendMessageArray } from "../kafka/producer.js";
import type { BatteryBankState } from "../types/battery-bank.types.js";
import {
	getAllBancoIdsWithState,
	getMessageFromRedis,
	saveMessageToDatabase,
	saveMessageToRedis,
} from "../message/message.service.js";

const CHRON_INTERVAL_MS = 60 * 1000;

async function applyChronAlarmsToBanco(bancoId: string, producer: Producer) {
	const state = await getMessageFromRedis<BatteryBankState>(`leitura:${bancoId}`);

	if (!state) return;

	state.timestamp = new Date(state.timestamp);

	const alertEvents = applyAlarms(state, ChronAlarms, state);

	// Rules may update ruleState (e.g. the offline rule's lastOnline counter)
	// even when no alarm transition happened, so this must persist unconditionally.
	const redisPromise = saveMessageToRedis(`leitura:${bancoId}`, state);

	if (alertEvents.length === 0) {
		await redisPromise;
		return;
	}

	console.log(`New Chron Alarm Events for ${bancoId}:`, alertEvents);

	await Promise.all([
		redisPromise,
		sendMessageArray(producer, env.KAFKA_ALARM_TOPIC, alertEvents),
		...alertEvents.map((event) => saveMessageToDatabase("alertas", event)),
	]);
}

export async function runChronAlarms(producer: Producer) {
	const bancoIds = await getAllBancoIdsWithState();

	console.log(`Running chron alarms for ${bancoIds.length} banco(s)`);

	await Promise.all(
		bancoIds.map((bancoId) =>
			applyChronAlarmsToBanco(bancoId, producer).catch((error) =>
				console.error(`Error running chron alarms for banco ${bancoId}:`, error)
			)
		)
	);
}

export function startChronAlarmsJob(producer: Producer) {
	console.log(`Starting chron alarms job (every ${CHRON_INTERVAL_MS / 1000}s)`);

	return setInterval(() => {
		runChronAlarms(producer).catch((error) => console.error('Error running chron alarms job:', error));
	}, CHRON_INTERVAL_MS);
}
