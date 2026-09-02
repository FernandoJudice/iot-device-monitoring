import { getBankArrayAlarms } from "../alarms/alarms.service.js";
import { getDb } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import type { BatteryBank } from "../shared/bank.types.js";
import type { Site, SiteWithActiveAlarms } from "./sites.types.js";

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


export async function getSites(): Promise<SiteWithActiveAlarms[]> {
	const db = getDb()

	const sites = await db.collection<Site>('sites')
		.find({}, { projection: { _id: 0 } }).toArray()

	return withActiveAlarmsCount(sites)
}

export async function getSitesByContracts(contracts: string[]): Promise<SiteWithActiveAlarms[]> {
	const db = getDb()

	const sites = await db.collection<Site>('sites')
		.find({ contratoId: { $in: contracts } }, { projection: { _id: 0 } }).toArray()

	return withActiveAlarmsCount(sites)
}

async function withActiveAlarmsCount(sites: Site[]): Promise<SiteWithActiveAlarms[]> {
	const db = getDb()

	const siteIds = sites.map(site => site.siteId)

	if (siteIds.length <= 0) {
		return []
	}

	const banks = await db.collection<BatteryBank>('bancos')
		.find({ siteId: { $in: siteIds } }).toArray()

	const bankIdsBySite = new Map<string, string[]>()
	for (const bank of banks) {
		const bankIds = bankIdsBySite.get(bank.siteId) ?? []
		bankIds.push(bank.bancoId)
		bankIdsBySite.set(bank.siteId, bankIds)
	}

	return Promise.all(sites.map(async (site) => {
		const bankIds = bankIdsBySite.get(site.siteId) ?? []
		const alarms = await getBankArrayAlarms(bankIds)
		const activeAlarmsCount = alarms.filter(alarm => alarm.status === 'active').length

		return { ...site, activeAlarmsCount }
	}))
}