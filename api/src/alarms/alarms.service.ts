import { redisClient } from "../config/redis.js";
import type { AlarmEvent } from "./alarms.types.js";

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
		const result = Object.values(alarms).map(alarm => JSON.parse(alarm));
		return result
	}

	return [];
}

export async function getBankArrayAlarms(ids: string[]) {

	const alarms = await Promise.all(
		ids.map((id) => getBankAlarms(id))
	)

	return alarms.flat()
}