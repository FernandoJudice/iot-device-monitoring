import { getDb } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import type { BatteryBank } from "../shared/bank.types.js";
import type { SiteWithActiveAlarms } from "./sites.types.js";

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


export async function getSites() {
	const db = getDb()

	const sites = await db.collection('sites').aggregate<SiteWithActiveAlarms>([
		{
			$lookup: {
				from: 'alertas',
				localField: 'siteId',
				foreignField: 'siteId',
				as: 'alertas'
			}
		},
		{
			$addFields: {
				activeAlarmsCount: {
					$size: {
						$filter: {
							input: '$alertas',
							as: 'alerta',
							cond: { $eq: ['$$alerta.status', 'active'] }
						}
					}
				}
			}
		},
		{
			$project: { alertas: 0, _id: 0 }
		}
	]).toArray()

	return sites
}

export async function getSitesByContracts(contracts: string[]) {
	const db = getDb()

	const sites = await db.collection('sites').aggregate<SiteWithActiveAlarms>([
		{
			$match: { contratoId: { $in: contracts } }
		},
		{
			$lookup: {
				from: 'alertas',
				localField: 'siteId',
				foreignField: 'siteId',
				as: 'alertas'
			}
		},
		{
			$addFields: {
				activeAlarmsCount: {
					$size: {
						$filter: {
							input: '$alertas',
							as: 'alerta',
							cond: { $eq: ['$$alerta.status', 'active'] }
						}
					}
				}
			}
		},
		{
			$project: { alertas: 0, _id: 0 }
		}
	]).toArray()

	return sites
}