export type Site = {
	siteId: string,
	nome: string,
	uf: string,
	cidade: string,
	contratoId: string
}

export type SiteWithActiveAlarms = Site & {
	activeAlarmsCount: number
}
