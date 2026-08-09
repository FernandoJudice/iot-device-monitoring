import {z} from 'zod'

export const EnvSchema = z.object({
	KAFKA_BROKER: z.string(),
	KAFKA_ALARM_TOPIC: z.string(),
	MONGODB_URI: z.string(),
	REDIS_URL: z.string(),
	FRONTEND_URL: z.string(),
	PORT: z.coerce.number(),
	ACCESS_TOKEN_SECRET: z.string().min(32),
	ACCESS_TOKEN_DURATION_VALUE: z.coerce.number(),
	ACCESS_TOKEN_DURATION_UNIT: z.enum(['s', 'm', 'h', 'd']),
})

export type TEnv = z.infer<typeof EnvSchema>