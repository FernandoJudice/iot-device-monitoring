export async function waitFor<T>(
	check: () => Promise<T | undefined | null | false>,
	options: { timeoutMs?: number; intervalMs?: number; description?: string } = {}
): Promise<T> {
	const { timeoutMs = 20_000, intervalMs = 500, description = 'condition' } = options;
	const deadline = Date.now() + timeoutMs;

	while (true) {
		const result = await check();
		if (result) return result;

		if (Date.now() >= deadline) {
			throw new Error(`Timed out after ${timeoutMs}ms waiting for: ${description}`);
		}

		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
}
