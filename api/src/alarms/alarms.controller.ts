import type { AlarmEvent, AlarmQuery } from "./alarms.types.js";
import { getBankAlarms, getBankArrayAlarms, resolveAlarmToRedis, saveAlarmToRedis } from "./alarms.service.js";
import type { NextFunction, Request, Response } from 'express';
import type { JwtData } from "../auth/auth.types.js";
import { getBanksClient, getBanksOp } from "../banks/banks.service.js";

export async function processAlarm(alarm: AlarmEvent) {

	if (alarm.status === 'active') {
		await saveAlarmToRedis(alarm)
		// console.log(`Saved new active alarm:`, alarm)
	} else {
		await resolveAlarmToRedis(alarm)
		// console.log(`Resolved alarm:`, alarm)
	}
	
}


export async function getAlarms(
	req: Request<{}, {}, {}, AlarmQuery>,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const { status } = req.query
		const user = res.locals.user as JwtData;

		if (!status) {
			res.status(400).json({message: 'Invalid Query parameter'})
		}

		if ( status === 'ativo') {
			let banks

			if (user.role === 'operador') {
				banks = await getBanksOp()
			} else {
				banks = await getBanksClient(user.contracts)
			}

			const data = await getBankArrayAlarms(banks)

			res.status(200).json({
				data
			})
		} else {
			res.status(200).json({
				message: 'Nothing here'
			})
		}
	} catch (error: unknown) {
		next(error);
	}
}