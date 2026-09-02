import { env } from '../config/env.js';
import { getDb } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { JwtData, TSignIn, User } from './auth.types.js';


export async function validateUser(data: TSignIn): Promise<User | null> {
	const db = getDb()
	const user = await db.collection<User>('usuarios').findOne({ email: data.email });

	if (!user) return null;

	const match = await bcrypt.compare(data.password, user.senhaHash);

	return match ? user : null;
}

export async function issueNewAccessToken(
	payload: JwtData,
): Promise<string> {
	return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
		expiresIn: `${env.ACCESS_TOKEN_DURATION_VALUE}${env.ACCESS_TOKEN_DURATION_UNIT}`,
	});
}

export async function getUser(email: string): Promise<User | null> {
	const db = getDb()
	return await db.collection<User>('usuarios').findOne({ email: email });

}