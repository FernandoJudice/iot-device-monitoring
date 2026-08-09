import type { AlarmEvent, AlarmRule } from "./alarms.types.js";

interface AlarmState {
	timestamp: number;
	alertas?: string[];
}

export function applyAlarms<T extends AlarmState>(
	curState: T, 
	rules: AlarmRule<T>[], 
	lastState: T): AlarmEvent[] {
	const events: AlarmEvent[] = [];

	rules.forEach((rule) => {
		const event = applyAlarmRule(curState, rule, lastState);
		if (event) {
			events.push(event);
		}
	});
	return events;
}


export function applyAlarmRule<T extends AlarmState>(
	curState: T , 
	rule: AlarmRule<T>, 
	lastState: T): AlarmEvent | null {
	const isConditionMet = rule.evaluate(curState, lastState);
	const isAlarmActive = lastState.alertas?.includes(rule.name) ?? false;

	let result: AlarmEvent | null = null;

	if (lastState.alertas) {
		curState.alertas = [...lastState.alertas]
	}

	if (isConditionMet && !isAlarmActive) {
		curState.alertas = [...(curState.alertas ?? []), rule.name];
		result = {
			name: rule.name,
			timestamp: curState.timestamp,
			severity: rule.severity,
			status: 'active'
		};
	} else if (!isConditionMet && isAlarmActive) {
		if (curState.alertas) {
			curState.alertas = curState.alertas.filter((alerta) => alerta !== rule.name);
		}
		result = {
			name: rule.name,
			timestamp: curState.timestamp,
			severity: rule.severity,
			status: 'resolved'
		};
	}

	return result;
}