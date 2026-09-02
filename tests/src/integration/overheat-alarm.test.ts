import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { apiGet } from '../support/api-client.js';
import { cleanupBancoData, closeFixtures, registerTestBank } from '../support/fixtures.js';
import { uniqueBancoId } from '../support/ids.js';
import { publishReading } from '../support/mqtt-client.js';
import { waitFor } from '../support/wait-for.js';

type ActiveAlarm = {
	id: string;
	bancoId: string;
	name: string;
	timestamp: number;
	severity: string;
	status: 'active' | 'resolved';
};

const OVERTEMP_C = 30;

describe('an overheating reading published on MQTT surfaces as an active alarm on GET /alertas', () => {
	const { bancoId, siteId } = uniqueBancoId('ALARM');

	beforeAll(async () => {
		await registerTestBank({ bancoId, siteId, contratoId: 'CT-1001' });
	});

	afterAll(async () => {
		await cleanupBancoData(bancoId);
		await closeFixtures();
	});

	it('flows through ingestion -> kafka -> processor (alarm rule) -> redis and is readable via the API', async () => {
		expect(100).toBeGreaterThan(OVERTEMP_C);

		const reading = {
			bancoId,
			siteId,
			timestamp: new Date().toISOString(),
			tensaoV: 51.9,
			correnteA: 0.6,
			temperaturaC: 100,
			estadoCarga: 0.75,
			modo: 'flutuacao' as const,
		};

		await publishReading(reading);

		const found = await waitFor(
			async () => {
				const response = await apiGet<{ data: ActiveAlarm[] }>('/alertas?status=ativo');
				return response.data.find((alarm) => alarm.bancoId === bancoId && alarm.name === 'Sobretemperatura');
			},
			{ description: `active overheat alarm for ${bancoId} to show up via GET /alertas?status=ativo` }
		);

		expect(found).toBeDefined();
		expect(found?.status).toBe('active');
		expect(found?.severity).toBe('high');
		expect(found?.id).toBe(encodeURIComponent(`${bancoId}:Sobretemperatura`));
	});
});
