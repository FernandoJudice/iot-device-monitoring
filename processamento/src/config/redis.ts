import Redis from 'redis'
import { env } from './env.js'

export const redisClient = Redis.createClient({ url: env.REDIS_URL })