import { EnvSchema } from "./env.types.js"

export const env = EnvSchema.parse(process.env)