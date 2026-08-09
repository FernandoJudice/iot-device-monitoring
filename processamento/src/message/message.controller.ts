import type { Producer } from "kafkajs";
import { OnMsgAlarms } from "../alarms/alarms.config.js";
import { applyAlarms } from "../alarms/alarms.service.js";
import { env } from "../config/env.js";
import { sendMessageArray } from "../kafka/producer.js";
import type { BatteryBankState } from "../types/battery-bank.types.js";
import { getMessageFromRedis, saveMessageToDatabase, saveMessageToRedis } from "./message.service.js";

export async function processMessage(message: BatteryBankState, producer: Producer) {
	
	
	const lastState = await getMessageFromRedis<BatteryBankState>(`leitura:${message.bancoId}`)
	
	message.timestamp = new Date(message.timestamp)
	
	if (lastState) lastState.timestamp = new Date(lastState.timestamp)
		const alertEvents = applyAlarms(message, OnMsgAlarms, lastState)
	
	const redisPromise = saveMessageToRedis(`leitura:${message.bancoId}`, message)
	
	console.log(`Processed message:`, message)
	
	let producerPromise
	let alertDatabasePromise

	const databasePromise = saveMessageToDatabase("leituras", message)
	
	if (alertEvents.length > 0) {
		console.log(`New Alarm Events:`, alertEvents)
		producerPromise = sendMessageArray(producer, env.KAFKA_ALARM_TOPIC, alertEvents)
		alertDatabasePromise = alertEvents.map((event) => (saveMessageToDatabase("alertas", event)))
	}

	await Promise.all([
		databasePromise,
		redisPromise,
		producerPromise,
		...alertDatabasePromise ?? [],
	])
}