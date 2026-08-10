import { setAccessToken } from './tokenStore';
import { SignInResponse, TSignIn } from '@/api/auth/auth.types';

export async function signIn( data: TSignIn ): Promise<SignInResponse> { 
	const response = await fetch( 
		`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, 
		{ 
			method: 'POST', 
			headers: { 'Content-Type': 'application/json', }, 
			body: JSON.stringify(data), 
		} ); 
	
	if (!response.ok) { 
		const error = await response.json().catch(() => null); 
		throw new Error( error?.message ?? 'Invalid email or password' ); 
	}

	const body = await response.json() as SignInResponse

	setAccessToken(body.token)
	
	return body;
}