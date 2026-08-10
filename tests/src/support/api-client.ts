import { env } from './env.js';

let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string> {
	if (cachedToken) return cachedToken;

	const response = await fetch(`${env.apiUrl}/auth/sign-in`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: env.authEmail, password: env.authPassword }),
	});

	if (!response.ok) {
		throw new Error(`Sign-in failed with status ${response.status}: ${await response.text()}`);
	}

	const body = (await response.json()) as { token: string };
	cachedToken = body.token;
	return cachedToken;
}

export async function apiGet<T>(path: string): Promise<T> {
	const token = await getAuthToken();

	const response = await fetch(`${env.apiUrl}${path}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`GET ${path} failed with status ${response.status}: ${await response.text()}`);
	}

	return response.json() as Promise<T>;
}
