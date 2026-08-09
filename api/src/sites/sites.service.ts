import { getDb } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import type { BatteryBank } from "../shared/bank.types.js";

export async function getBanksConstract(siteId: string, contracts: string[]) {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.find({ siteId: siteId, contratoId: {$in: contracts} }).toArray();

	const redisKeys = banks.map(bank => bank.bancoId)

	if (redisKeys.length <= 0) {
		return []
	}

	const messages = await redisClient.mGet(redisKeys)

	const result = banks.map((bank, index) => ({
		...bank,
		latestMessage: messages[index]
			? JSON.parse(messages[index])
			: null
	}));

	return result;
}

export async function getAllBanks(siteId: string) {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.find({ siteId: siteId }).toArray();

	const redisKeys = banks.map(bank => bank.bancoId)

	if (redisKeys.length <= 0) {
		return []
	}

	const messages = await redisClient.mGet(redisKeys)

	const result = banks.map((bank, index) => ({
		...bank,
		latestMessage: messages[index]
			? JSON.parse(messages[index])
			: null
	}));

	return result;
}