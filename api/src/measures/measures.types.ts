export type BatteryBankMeasure = {
	bancoId: string
	siteId: string
	timestamp: Date
	tensaoV: number
	correnteA: number
	temperaturaC: number
	estadoCarga: number
	modo: `flutuacao` | `descarga` | `recarga`
	alertas?: string[]
}