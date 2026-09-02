import type { AlarmRule, SeverityLevel } from "./alarms.types.js";

interface LowVoltageState {
	tensaoV: number;
	ruleState?: {
		leiturasConsec?: number;
	}
}

export function createLowVoltageAlarmRule (
	name: string, 
	severity: SeverityLevel, 
	thresholdV: number,
	lowReadingCount: number = 3,
): 
	AlarmRule<LowVoltageState> {
  return {
	name,
	severity,
	evaluate: (curState: LowVoltageState, lastState: LowVoltageState | null) => {
		let result = false;
		if (curState.tensaoV < thresholdV) {
			if (!lastState?.ruleState?.leiturasConsec) {
				curState.ruleState = {
					...curState.ruleState,
					leiturasConsec: 1
				};
				result = false;
			}

			else {
				const curCounting = lastState.ruleState.leiturasConsec + 1

				curState.ruleState = {
					...curState.ruleState,
					leiturasConsec: curCounting
				};
				if (curCounting >= lowReadingCount) {
					result = true;
				}
			}
		}
		return result;
	}
  };
}