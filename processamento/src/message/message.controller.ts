import { OnMsgAlarms } from "../alarms/alarms.config.js";
import { applyAlarms } from "../alarms/alarms.service.js";
import type { BatteryBankState } from "../types/battery-bank.types.js";
import { getMessageFromRedis, saveMessageToDatabase, saveMessageToRedis } from "./message.service.js";

export async function processMessage(message: BatteryBankState) {
	await saveMessageToDatabase(message)
	const lastState = await getMessageFromRedis<BatteryBankState>(message.bancoId)
	message.timestamp = new Date(message.timestamp)
	if (lastState) lastState.timestamp = new Date(lastState.timestamp)
	const alertEvents = applyAlarms(message, OnMsgAlarms, lastState)

	await saveMessageToRedis(message.bancoId, message)

	console.log(message)
}