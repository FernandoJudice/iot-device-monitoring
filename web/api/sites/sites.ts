import { redirect } from "next/navigation";
import { apiFetch } from "../api-client";


export async function getSites() {
		const response = await apiFetch('/sites' , { 
			method: 'GET', 
			headers: { 'Content-Type': 'application/json', }, 
		})

		if (!response.ok) { 
				if (response.status == 401) {
					redirect('/sign-in')
				}
				const error = await response.json().catch(() => null); 
				throw new Error( error?.message ?? 'Invalid email or password' ); 
		}
		
		return response.json();
}