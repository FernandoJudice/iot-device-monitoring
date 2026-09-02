import {z} from 'zod'

export const EnvSchema = z.object({
	  MQTT_BROKER: z.string(),
	  BATTERY_BANK_TOPIC: z.string(),
	  KAFKA_BROKER: z.string(),
	  INGESTION_TOPIC: z.string()
})

export type TEnv = z.infer<typeof EnvSchema>