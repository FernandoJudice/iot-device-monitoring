import { getDb } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import type { BatteryBank } from "../shared/bank.types.js";

export async function getBanksClient(siteId: string, contracts: string[]) {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.find({ siteId: siteId, contratoId: {$in: contracts} }).toArray();

	return banks;
}

export async function getBanksOp(siteId: string) {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.find({ siteId: siteId }).toArray();

	return banks;
}