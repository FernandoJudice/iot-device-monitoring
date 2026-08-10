import type { BatteryBankReading } from "./readings.types.js";
import { broadcastToBanco } from "../ws/ws.server.js";

export async function processReading(reading: BatteryBankReading) {
	broadcastToBanco(reading.bancoId, { type: 'reading', data: reading })
}
