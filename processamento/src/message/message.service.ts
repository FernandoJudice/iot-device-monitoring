import { getDb } from "../config/db.js";
import { redisClient } from "../config/redis.js";

export async function saveMessageToDatabase(message: any) {
	  try {
		const db = getDb();
		const collection = db.collection("messages");
		await collection.insertOne(message);
		// console.log("Message saved to database:", message);
	  } catch (error) {
		console.error("Error saving message to database:", error);
	  }
}

export function saveMessageToRedis(id:string, message: any) {
	redisClient.set(`${id}`, JSON.stringify(message)).catch((err) => console.log(err))
}

export async function getMessageFromRedis<T>(id:string) {
	const message = await redisClient.get(`${id}`);

	if (message !== null) {
		return JSON.parse(message) as T;
	}

	return null;
}