import { fromZodError } from "zod-validation-error";
import type { Request, Response, NextFunction } from 'express';
import type z from "zod";

export function validateBodyMiddleware(schema: z.ZodSchema, ) {
	return async (req: Request, res: Response, next: NextFunction) => {
		console.log(req.body)
		const data = schema.safeParse(req.body);

		if (!data.success) {
			console.log(fromZodError(data.error));
			res.status(400).json(fromZodError(data.error));
			return;
		}

		res.locals.validatedData = data.data;
		next();
	};
}

export function validateQueryMiddleware(schema: z.ZodSchema) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const data = schema.safeParse(req.query);

		if (!data.success) {
			console.log(fromZodError(data.error));
			res.status(400).json(fromZodError(data.error));
			return;
		}

		res.locals.query = data.data;
		next();
	};
}
