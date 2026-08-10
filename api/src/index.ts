import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import cookieParser from 'cookie-parser';
import { auth as authRouter } from './auth/auth.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { connectToDatabase } from './config/db.js';
import { redisClient } from "./config/redis.js";
import { createConsumer, listenMessage } from './kafka/consumer.js';
import { processAlarm } from './alarms/alarms.controller.js';
import { processReading } from './readings/readings.controller.js';
import { sitesRouter } from './sites/sites.routes.js';
import { alarmsRouter } from './alarms/alarms.routes.js';
import { banksRouter } from './banks/banks.routes.js';
import { createWebSocketServer } from './ws/ws.server.js';

await connectToDatabase();
await redisClient.connect();

const alarmsConsumer = await createConsumer(env.KAFKA_ALARM_TOPIC).catch(async (error) => {
        console.error("Kafka connection failed. Retrying in 5s...", error);

        await new Promise(resolve => setTimeout(resolve, 5000));

        return createConsumer(env.KAFKA_ALARM_TOPIC);
    });

await listenMessage(
	alarmsConsumer,
	processAlarm
);

const readingsConsumer = await createConsumer(env.KAFKA_INGESTION_TOPIC, 'api-readings-group').catch(async (error) => {
        console.error("Kafka connection failed. Retrying in 5s...", error);

        await new Promise(resolve => setTimeout(resolve, 5000));

        return createConsumer(env.KAFKA_INGESTION_TOPIC);
    });;

await listenMessage(
	readingsConsumer,
	processReading
);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/auth', authRouter);
app.use('/sites', sitesRouter);
app.use('/alertas', alarmsRouter);
app.use('/bancos', banksRouter)
app.use(errorHandler);

const httpServer = createServer(app);
createWebSocketServer(httpServer);

httpServer.on('error', (error) => {
	throw error;
});

httpServer.listen(env.PORT, () => {
	console.log(`Server started at ${env.PORT}`);
});
