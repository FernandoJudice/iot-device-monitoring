import z from "zod";


export type User = {
	email: string,
	nome: string,
	perfil: 'operador' | 'client',
	contratos: string[],
	senhaHash: string
}

export type JwtData = {
	sub: string,
	role: 'operador' | 'client',
	contracts: string[]
}


export const SignInSchema = z.object({
	email: z.email('Invalid email address').trim().toLowerCase(),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})


export const RefreshTokensSchema = z.object({
	id: z.string(),
	userId: z.string(),
	tokenHash: z.string(),
	jti: z.string(),
	expiresAt: z.date(),
	revokedAt: z.date().optional(),
	replacedBy: z.string(),
	createdAt: z.date(),
})

export type TSignIn = z.infer<typeof SignInSchema>;
