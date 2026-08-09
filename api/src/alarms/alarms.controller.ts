import type { AlarmEvent } from "./alarm.types.js";
import { resolveAlarmToRedis, saveAlarmToRedis } from "./alarms.service.js";

export async function processAlarm(alarm: AlarmEvent) {

	if (alarm.status === 'active') {
		saveAlarmToRedis(alarm)
	} else {
		resolveAlarmToRedis(alarm)
	}
	
}