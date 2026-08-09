import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import cookieParser from 'cookie-parser';
import { auth as authRouter } from './auth/auth.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { connectToDatabase } from './config/db.js';
import { redisClient } from "./config/redis.js";

await connectToDatabase();
await redisClient.connect();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/api/v1/auth', authRouter);
app.use(errorHandler);

app.listen(env.PORT, (error) => {
	if (error) {
		throw error;
	}
	console.log(`Server started at ${env.PORT}`);
});
