import z from "zod";

export type SignInResponse = {
	token: string
}

export const SignInSchema = z.object({
	email: z.email('Invalid email address').trim().toLowerCase(),
	password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export type TSignIn = z.infer<typeof SignInSchema>;

export class UnauthorizedError extends Error {
	constructor() {
		super('Session expired. Please sign in again.');
		this.name = 'UnauthorizedError';
	}
}
