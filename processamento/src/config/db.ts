import { Db, MongoClient } from "mongodb";
import { env } from "./env.js";

const client = new MongoClient(env.MONGODB_URI);

let db: Db

export async function connectToDatabase() {
  try {
	await client.connect();
	db = client.db();
	console.log("Connected to MongoDB");
	return db;
  } catch (error) {
	console.error("Error connecting to MongoDB:", error);
	throw error;
  }
}

export function getDb(): Db {
    if (!db) {
        throw new Error("MongoDB has not been connected");
    }

    return db;
}