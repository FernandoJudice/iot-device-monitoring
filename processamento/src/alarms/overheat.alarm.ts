import type { AlarmRule, SeverityLevel } from "./alarms.types.js";

interface OverheatState {
	temperaturaC: number;
}

export function createOverheatAlarmRule (
	name: string, 
	severity: SeverityLevel, 
	thresholdC: number): 
	AlarmRule<OverheatState> {
  return {
	name,
	severity,
	evaluate: (curState: OverheatState, _lastState: OverheatState | null) => {
		return curState.temperaturaC > thresholdC;
	}
  };
}