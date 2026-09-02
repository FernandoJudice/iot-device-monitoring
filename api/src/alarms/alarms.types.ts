import z from "zod";

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlarmEvent = {
	id: string,
	bancoId: string,
	name: string;
	timestamp: number;
	severity: SeverityLevel;
	status: 'active' | 'resolved';
	acknowledge?: string[]
}

export const AlarmQuerySchema = z.object({
	status: z.enum(['ativo']),
})

export type AlarmQuery = {
	status?: 'ativo'
}