import { redirect } from "next/navigation";
import { apiFetch } from "../api-client";
import type { GetSitesResponse } from "./sites.types";


export async function getSites(): Promise<GetSitesResponse> {
		const response = await apiFetch('/sites' , {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', },
		})

		if (!response.ok) {
				if (response.status == 401) {
					redirect('/sign-in')
				}
				const error = await response.json().catch(() => null);
				throw new Error( error?.message ?? 'Failed to fetch sites' );
		}

		return response.json();
}