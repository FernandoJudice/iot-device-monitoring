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

export async function getBankArrayAlarms(ids: string[]) {
	
	const alarms = await Promise.all(
		ids.map((id) => getBankAlarms(id))
	)
	
	return alarms.flat()
}

export async function setAcknowledgeAlarm(id: string, name: string, userid: string) {
	const alarm = await getAlarm(id, name)
	if (alarm) {
		(alarm.acknowledge ??= []).push(userid);
		console.log(`${userid} Acknowledged alarm ${id}:${name}`)
		await saveAlarmToRedis(alarm)
		return alarm
	}

	return null
}

async function getBankAlarms(id: string) {
	const alarms = await redisClient.hGetAll(`alerta:${id}`);
	if (alarms) {
		const result = Object.values(alarms).map(alarm => JSON.parse(alarm));
		return result
	}

	return [];
}

async function getAlarm(id: string, name: string): Promise<AlarmEvent | null> {
	const alarmString = await redisClient.hGet(`alerta:${id}`, name)
	if (alarmString) {
		return JSON.parse(alarmString)
	} 
	return null
}