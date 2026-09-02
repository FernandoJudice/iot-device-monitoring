export type BatteryBank = {
	bancoId: string,
	siteId: string,
	contratoId: string,
	modelo: string,
	capacidadeAh: number,
	tensaoNominalV: number,
	instaladoEm: string
}

export type BankReading = {
	bancoId: string,
	siteId: string,
	timestamp: string,
	tensaoV: number,
	correnteA: number,
	temperaturaC: number,
	estadoCarga: number,
	modo: 'flutuacao' | 'descarga' | 'recarga'
}

export type BankWithLatestReading = BatteryBank & {
	latestMessage: BankReading | null
}

export type GetSiteBanksResponse = {
	result: BankWithLatestReading[]
}

export type GetBankReadingsResponse = {
	data: BankReading[]
}
