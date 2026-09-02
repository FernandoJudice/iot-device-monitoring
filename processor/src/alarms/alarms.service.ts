import type { AlarmEvent, AlarmRule } from "./alarms.types.js";

interface AlarmState {
	bancoId: string;
	siteId: string,
    contratoId: string,
	timestamp: Date;
	alertas?: string[];
}

export function applyAlarms<T extends AlarmState>(
	curState: T, 
	rules: AlarmRule<T>[], 
	lastState: T | null): AlarmEvent[] {
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
	lastState: T | null): AlarmEvent | null {
	const isConditionMet = rule.evaluate(curState, lastState);
	const isAlarmActive = lastState?.alertas?.includes(rule.name) ?? false;

	let result: AlarmEvent | null = null;

	if (isConditionMet) {
		curState.alertas = [...(curState.alertas ?? []), rule.name];
	}

	if (isConditionMet && !isAlarmActive) {
		result = {
			bancoId: curState.bancoId,
			siteId: curState.siteId,
    		contratoId: curState.contratoId,
			name: rule.name,
			timestamp: curState.timestamp.getTime(),
			severity: rule.severity,
			status: 'active'
		};
	} else if (!isConditionMet && isAlarmActive) {
		result = {
			bancoId: curState.bancoId,
			siteId: curState.siteId,
    		contratoId: curState.contratoId,
			name: rule.name,
			timestamp: curState.timestamp.getTime(),
			severity: rule.severity,
			status: 'resolved'
		};
	}

	return result;
}