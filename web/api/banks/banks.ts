import { apiFetch } from "../api-client";
import { UnauthorizedError } from '../auth/auth.types';
import type { GetBankReadingsResponse, GetSiteBanksResponse } from "./banks.types";

export async function getSiteBanks(siteId: string): Promise<GetSiteBanksResponse> {
	const response = await apiFetch(`/sites/${siteId}/bancos`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', },
	})

	if (!response.ok) {
		if (response.status == 401) {
			throw new UnauthorizedError();
		}
		const error = await response.json().catch(() => null);
		throw new Error( error?.message ?? 'Failed to fetch banks' );
	}

	return response.json();
}

export async function getBankReadings(
	bancoId: string,
	de: Date,
	ate: Date,
	pagina: number = 1,
): Promise<GetBankReadingsResponse> {
	const params = new URLSearchParams({
		de: de.toISOString(),
		ate: ate.toISOString(),
		pagina: String(pagina),
	})

	const response = await apiFetch(`/bancos/${bancoId}/leituras?${params.toString()}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', },
	})

	if (!response.ok) {
		if (response.status == 401) {
			throw new UnauthorizedError();
		}
		const error = await response.json().catch(() => null);
		throw new Error( error?.message ?? 'Failed to fetch readings' );
	}

	return response.json();
}
