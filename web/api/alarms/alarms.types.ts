export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export type AlarmEvent = {
	id: string,
	bancoId: string,
	siteId: string,
	contratoId: string,
	name: string,
	timestamp: number,
	severity: SeverityLevel,
	status: 'active' | 'resolved',
	acknowledge?: string[]
}

export type GetActiveAlarmsResponse = {
	data: AlarmEvent[]
}
