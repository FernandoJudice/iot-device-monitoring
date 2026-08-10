import type { Request, Response, NextFunction } from "express";
import { ReadingsQuerySchema, type BankReadingQuery, type TQuerySchema as TReadingQuery } from "./bank.types.js";
import type { JwtData } from "../auth/auth.types.js";
import { getBank } from "./banks.service.js";
import { getReadings } from "../readings/reading.services.js";

export async function getBankReadings(
	req: Request<{id: string}, {}, {}, BankReadingQuery>,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
			const { id } = req.params
			const user = res.locals.user as JwtData;
			
			let { de, ate, pagina } = res.locals.query as TReadingQuery

			const from = de ?? new Date(0)
			const to = ate ?? new Date()
			const page = pagina ?? 1

			if (user.role === 'client') {
				
				const bank = await getBank(id, user.contracts)

				if (!bank) {
					console.log('User does not have access to bank')
					res.status(404)
				}

			}
		
			const data = await getReadings(id, from, to, page)

			res.status(200).json({
				data
			})
		} catch (error: unknown) {
			next(error);
		}
}