export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlarmEvent = {
	bancoId: string,
	name: string;
	timestamp: number;
	severity: SeverityLevel;
	status: 'active' | 'resolved';
}