import type { AlarmRule, SeverityLevel } from "./alarms.types.js";

interface OfflineState {
	timestamp: Date;
}

export function createOfflineAlarmRule (
	name: string,
	severity: SeverityLevel,
	thresholdS: number):
	AlarmRule<OfflineState> {
  return {
	name,
	severity,
	evaluate: (curState: OfflineState, lastState: OfflineState | null) => {
		if (!lastState) return false;
		return (new Date().getTime() - lastState.timestamp.getTime())/1000 > thresholdS ;
	}
  };
}