import { apiFetch } from "../api-client";
import { UnauthorizedError } from '../auth/auth.types';
import type { GetSitesResponse } from "./sites.types";


export async function getSites(): Promise<GetSitesResponse> {
		const response = await apiFetch('/sites' , {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', },
		})

		if (!response.ok) {
				if (response.status == 401) {
					throw new UnauthorizedError();
				}
				const error = await response.json().catch(() => null);
				throw new Error( error?.message ?? 'Failed to fetch sites' );
		}

		return response.json();
}