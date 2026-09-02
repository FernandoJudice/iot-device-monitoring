
type BatteryBankMessage = {
	bancoId: string
	siteId: string
	timestamp: Date
	tensaoV: number
	correnteA: number
	temperaturaC: number
	estadoCarga: number
	modo: `flutuacao` | `descarga` | `recarga`
}

type BatteryBankAlarms = {
	contratoId: string
	alertas?: string[]
	ruleState?: Record<string, unknown>
}

export type BatteryBankState = BatteryBankMessage & BatteryBankAlarms
