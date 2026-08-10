import { redirect } from "next/navigation";
import { apiFetch } from "../api-client";
import type { GetActiveAlarmsResponse } from "./alarms.types";

export async function getActiveAlarms(): Promise<GetActiveAlarmsResponse> {
	const response = await apiFetch('/alertas?status=ativo', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json', },
	})

	if (!response.ok) {
		if (response.status == 401) {
			redirect('/sign-in')
		}
		const error = await response.json().catch(() => null);
		throw new Error( error?.message ?? 'Failed to fetch alarms' );
	}

	return response.json();
}
