import type { AlarmRule, SeverityLevel } from "./alarms.types.js";

interface OfflineState {
	timestamp: Date;
	ruleState: {
		lastOnline?: number;
	};
}

export function createOfflineAlarmRule (
	name: string, 
	severity: SeverityLevel, 
	thresholdS: number): 
	AlarmRule<OfflineState> {
  return {
	name,
	severity,
	evaluate: (curState: OfflineState, lastState: OfflineState) => {
		if (!lastState.ruleState.lastOnline) {
			console.log(`Invalid State: lastState.ruleState.lastOnline is undefined. Restarting counter.`);
			curState.ruleState.lastOnline = new Date().getTime();
			return false;
		}
		return (new Date().getTime() - lastState.ruleState.lastOnline)/1000 > thresholdS ;
	}
  };
}