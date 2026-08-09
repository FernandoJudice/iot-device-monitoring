import type { AlarmRule, SeverityLevel } from "./alarms.types.js";

interface LowVoltageState {
	tensaoV: number;
	ruleState: {
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
	evaluate: (curState: LowVoltageState, lastState: LowVoltageState) => {
		let result = false;
		if (curState.tensaoV > thresholdV) {
			curState.ruleState.leiturasConsec = 0;
			result = false;
		} else if (!lastState.ruleState.leiturasConsec) {
			console.log(`Invalid State: lastState.ruleState.leiturasConsec is undefined. Restarting counter.`);
			curState.ruleState.leiturasConsec = 1;
			result = false;
		}
		else {
			curState.ruleState.leiturasConsec = lastState.ruleState.leiturasConsec + 1;
			if (curState.ruleState.leiturasConsec >= lowReadingCount) {
				result = true;
			}
		}
		return result;
	}
  };
}