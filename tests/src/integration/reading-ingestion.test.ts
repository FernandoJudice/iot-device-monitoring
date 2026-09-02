import { afterAll, describe, expect, it } from 'vitest';
import { apiGet } from '../support/api-client.js';
import { cleanupBancoData, closeFixtures } from '../support/fixtures.js';
import { uniqueBancoId } from '../support/ids.js';
import { publishReading } from '../support/mqtt-client.js';
import { waitFor } from '../support/wait-for.js';

type StoredReading = {
	bancoId: string;
	siteId: string;
	timestamp: string;
	tensaoV: number;
	correnteA: number;
	temperaturaC: number;
	estadoCarga: number;
	modo: string;
};

describe('a normal reading published on MQTT reaches GET /bancos/:id/leituras', () => {
	const { bancoId, siteId } = uniqueBancoId('READ');

	afterAll(async () => {
		await cleanupBancoData(bancoId);
		await closeFixtures();
	});

	it('flows through ingestion -> kafka -> processor -> mongo and is readable via the API', async () => {
		const reading = {
			bancoId,
			siteId,
			timestamp: new Date().toISOString(),
			tensaoV: 52.73,
			correnteA: -0.42,
			temperaturaC: 24.6,
			estadoCarga: 0.91,
			modo: 'flutuacao' as const,
		};

		await publishReading(reading);

		const de = new Date(Date.now() - 5 * 60_000).toISOString();
		const ate = new Date(Date.now() + 5 * 60_000).toISOString();

		const found = await waitFor(
			async () => {
				const response = await apiGet<{ data: StoredReading[] }>(
					`/bancos/${bancoId}/leituras?de=${encodeURIComponent(de)}&ate=${encodeURIComponent(ate)}&pagina=1`
				);
				return response.data.find((r) => r.bancoId === bancoId);
			},
			{ description: `reading for ${bancoId} to show up via GET /bancos/:id/leituras` }
		);

		expect(found).toBeDefined();
		expect(found?.siteId).toBe(siteId);
		expect(found?.tensaoV).toBeCloseTo(reading.tensaoV);
		expect(found?.correnteA).toBeCloseTo(reading.correnteA);
		expect(found?.temperaturaC).toBeCloseTo(reading.temperaturaC);
		expect(found?.estadoCarga).toBeCloseTo(reading.estadoCarga);
		expect(found?.modo).toBe(reading.modo);
		expect(new Date(found!.timestamp).getTime()).toBe(new Date(reading.timestamp).getTime());
	});
});
