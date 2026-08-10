import { apiFetch } from "../api-client";
import { UnauthorizedError } from '../auth/auth.types';
import type { GetActiveAlarmsResponse } from "./alarms.types";

export async function getActiveAlarms(): Promise<GetActiveAlarmsResponse> {
	const response = await apiFetch('/alertas?status=ativo', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', },
	})

	if (!response.ok) {
		if (response.status == 401) {
			throw new UnauthorizedError();
		}
		const error = await response.json().catch(() => null);
		throw new Error( error?.message ?? 'Failed to fetch alarms' );
	}

	return response.json();
}
