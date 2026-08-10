import type { NextFunction, Request, Response } from "express";
import type { JwtData } from "../auth/auth.types.js";
import { getAllBanks, getBanksConstract, getSites, getSitesByContracts } from "./sites.service.js";

export async function getSiteBanks(
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const user = res.locals.user as JwtData;
		const { id } = req.params;

		let result

		if (!id) {
			res.status(404)
		}

		if (user.role === 'operador') {
			result = await getAllBanks(id)
		} else {
			result = await getBanksConstract(id, user.contracts)
		}

		res.status(200).json({
			result
		});
	} catch (error: unknown) {
		next(error);
	}

}

export async function getUserSites(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const user = res.locals.user as JwtData;

		let result

		if (user.role === 'operador') {
			result = await getSites()
		} else {
			result = await getSitesByContracts(user.contracts)
		}

		res.status(200).json({
			result
		});
	} catch (error: unknown) {
		next(error);
	}

}