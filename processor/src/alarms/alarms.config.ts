import { env } from "../config/env.js"
import type { BatteryBankState } from "../types/battery-bank.types.js"
import type { AlarmRule } from "./alarms.types.js"
import { createLowVoltageAlarmRule } from "./low-voltage.alarm.js"
import { createModeDurationAlarmRule } from "./mode-duration.alarm.js"
import { createOfflineAlarmRule } from "./offline.alarm.js"
import { createOverheatAlarmRule } from "./overheat.alarm.js"

export const OnMsgAlarms: AlarmRule<BatteryBankState>[] = [
	createOverheatAlarmRule('Sobretemperatura', 'high', env.OVERTEMP_C),
	createLowVoltageAlarmRule('Tensão Baixa', 'critical', env.LOW_VOLTAGE_V, 3),
	createModeDurationAlarmRule('Descarga prolongada', 'medium', 'descarga', env.DISCHARGE_TIME_MIN*60)
]

export const ChronAlarms: AlarmRule<BatteryBankState>[] = [
	createOfflineAlarmRule('Banco offline', 'high', 15*60)
]