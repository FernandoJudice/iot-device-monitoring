import * as authService from './auth.service.js';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import type { User } from './auth.types.js';

export async function onSignIn(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const user = res.locals.user as User;
		const accessToken =
			await authService.issueNewAccessToken({
				sub: user.email,
				role: user.perfil,
				contracts: user.contratos
			});

		console.log(user, `User Sign In`);

		res.status(200).json({
			token: accessToken,
		});
	} catch (error: unknown) {
		next(error);
	}
}