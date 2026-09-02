import { MongoClient } from 'mongodb';
import Redis from 'redis';
import { env } from './env.js';

const mongo = new MongoClient(env.mongoUri);
const redis = Redis.createClient({ url: env.redisUrl });

let connected: Promise<void> | null = null;

async function ensureConnected() {
	connected ??= Promise.all([mongo.connect(), redis.connect()]).then(() => undefined);
	return connected;
}

export async function registerTestBank(params: { bancoId: string; siteId: string; contratoId: string }) {
	await ensureConnected();
	await mongo.db().collection('bancos').insertOne({
		bancoId: params.bancoId,
		siteId: params.siteId,
		contratoId: params.contratoId,
		modelo: 'Test Fixture',
		capacidadeAh: 100,
		tensaoNominalV: 54,
		instaladoEm: new Date().toISOString().slice(0, 10),
	});
}

export async function cleanupBancoData(bancoId: string) {
	await ensureConnected();
	await Promise.all([
		mongo.db().collection('bancos').deleteMany({ bancoId }),
		mongo.db().collection('leituras').deleteMany({ bancoId }),
		mongo.db().collection('alertas').deleteMany({ bancoId }),
		redis.del(`lastState:leitura:${bancoId}`),
		redis.del(`alerta:${bancoId}`),
	]);
}

export async function closeFixtures() {
	if (!connected) return;
	await connected;
	await Promise.all([mongo.close(), redis.quit()]);
}
