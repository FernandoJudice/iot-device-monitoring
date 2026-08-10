import type { AlarmEvent, AlarmQuery } from "./alarms.types.js";
import { getBankArrayAlarms, resolveAlarmToRedis, saveAlarmToRedis, setAcknowledgeAlarm } from "./alarms.service.js";
import type { NextFunction, Request, Response } from 'express';
import type { JwtData } from "../auth/auth.types.js";
import { getBank, getBanksClient, getBanksOp } from "../banks/banks.service.js";
import { broadcastToBanco } from "../ws/ws.server.js";

export async function processAlarm(alarm: AlarmEvent) {
	alarm.id = encodeURIComponent(`${alarm.bancoId}:${alarm.name}`)
	if (alarm.status === 'active') {
		await saveAlarmToRedis(alarm)
		console.log(`Saved new active alarm:`, alarm)
	} else {
		await resolveAlarmToRedis(alarm)
		console.log(`Resolved alarm:`, alarm)
	}

	broadcastToBanco(alarm.bancoId, { type: 'alarm', data: alarm })
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


export async function acknowledgeAlarm(
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const [bancoId, alarmName] = req.params.id.split(":");
		const user = res.locals.user as JwtData;

		if (!bancoId || !alarmName) {
			res.status(400).json({message: 'Invalid Query parameter'})
			return
		}

		if (user.role === 'client') {
						
			const bank = await getBank(bancoId, user.contracts)

			if (!bank) {
				console.log('User does not have access to bank')
				res.status(404)
			}

		}

		const data = await setAcknowledgeAlarm(bancoId, alarmName, user.sub)

		if (data) {
			res.status(200).json({
				data
			})
		} else {
			res.status(404).json({
				message: 'Alarm not found for this user'
			})
		}
		
	} catch (error: unknown) {
		next(error);
	}
}