import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	
	console.log('Logger failed to start');

	console.error(err);

	if (err instanceof Error) {
		console.error(err.stack);
	}
	
	if (err) {
		return res.status(500).json({
			message: 'Internal Server Error',
		});
	}

	next();
}
