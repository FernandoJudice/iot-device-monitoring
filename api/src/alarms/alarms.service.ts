import { redisClient } from "../config/redis.js";
import type { AlarmEvent } from "./alarm.types.js";

export function saveAlarmToRedis(alarm: AlarmEvent) {
	return redisClient.hSet(
		`alerta:${alarm.bancoId}`,
		alarm.name, 
		JSON.stringify(alarm))
}

export function resolveAlarmToRedis(alarm: AlarmEvent) {
	return redisClient.hDel(`alerta:${alarm.bancoId}`, alarm.name)
}

export async function getBankAlarms(id: string) {

	const alarms = await redisClient.hGetAll(`alerta:${id}`);

	if (alarms) {
		return Object.values(alarms).map(alarm => JSON.parse(alarm));
	}

	return [];
}

export async function getBankArrayAlarms(ids: string[]) {

	return await Promise.all([
		ids.map((id) => getBankAlarms(id))
	])
}