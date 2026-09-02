import { getDb } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import type { BatteryBank } from "../shared/bank.types.js";

export async function getBanksClient( contracts: string[]) {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.find({ contratoId: {$in: contracts} }).toArray();

	return banks.map(bank => bank.bancoId);
}

export async function getBanksOp() {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.find().toArray();

	return banks.map(bank => bank.bancoId);
}

export async function getBank(id: string, contracts: string[]) {
	const db = getDb()
	
	const banks = await db.collection<BatteryBank>('bancos')
		.findOne({ bancoId: id, contratoId: {$in: contracts} })
	
	return banks
}