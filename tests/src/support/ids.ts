import { randomUUID } from 'node:crypto';

export function uniqueBancoId(label: string) {
	const suffix = randomUUID().slice(0, 8);
	return {
		bancoId: `TEST-${label}-${suffix}`,
		siteId: `TEST-SITE-${suffix}`,
	};
}
