import type { AlarmRule, SeverityLevel } from "./alarms.types.js";

interface DischargeState {
	timestamp: Date;
	modo: `flutuacao` | `descarga` | `recarga`;
	ruleState: {
		descargaIncio?: number;
	}
}

export function createModeDurationAlarmRule (
	name: string, 
	severity: SeverityLevel, 
	mode: `flutuacao` | `descarga` | `recarga`,
	dischargeDurationS: number = 15*60,
): 
	AlarmRule<DischargeState> {
  return {
	name,
	severity,
	evaluate: (curState: DischargeState, lastState: DischargeState) => {
		let result = false;
		if (curState.modo === mode) {
			if (lastState.modo !== mode) {
				curState.ruleState.descargaIncio = curState.timestamp.getTime();
				result = false;
			} else if (!lastState.ruleState.descargaIncio) {
				console.log(`Invalid State: lastState.ruleState.descargaIncio is undefined for mode ${mode}. Restarting counter.`);
				curState.ruleState.descargaIncio = curState.timestamp.getTime();
				result = false;
			} else {
				const elapsedTime = (curState.timestamp.getTime() - lastState.ruleState.descargaIncio) / 1000;
				result = elapsedTime >= dischargeDurationS;
			}
		} 
		return result;
	}
  };
}