import { getDb } from "../config/db.js";

const READINGS_PAGE_SIZE = 20;

export async function getReadings(
    id: string,
    from: Date,
    to: Date,
    page: number
) {
    const db = getDb();

    const readings = await db
        .collection('leituras')
        .find({
            bancoId: id,
            timestamp: {
                $gte: from,
                $lt: to
            }
        })
        .sort({ timestamp: -1 })
        .skip((page - 1) * READINGS_PAGE_SIZE)
        .limit(READINGS_PAGE_SIZE)
        .toArray();

    return readings;
}