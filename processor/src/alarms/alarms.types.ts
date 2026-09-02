export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlarmEvent = {
	bancoId: string,
	siteId: string,
    contratoId: string,
	name: string;
	timestamp: number;
	severity: SeverityLevel;
	status: 'active' | 'resolved';
}

export type AlarmRule<T> = {
	name: string;
	severity: SeverityLevel;
	evaluate: (curState: T, lastState: T | null) => boolean;
}
