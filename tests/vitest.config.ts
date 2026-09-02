import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/integration/**/*.test.ts'],
		// The full chain (mosquitto -> ingestion -> kafka -> processor -> mongo/redis -> api)
		// is slower than a unit test; give each step room before we declare it stuck.
		testTimeout: 30_000,
		hookTimeout: 30_000,
	},
});
