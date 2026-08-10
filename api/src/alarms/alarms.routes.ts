import { Router } from 'express';
import * as alarmsController from './alarms.controller.js';
import { authJwtheader } from '../auth/auth.middleware.js';

export const alarmsRouter = Router({ mergeParams: true }) as Router;

alarmsRouter.get(
	'/',
	authJwtheader,
	alarmsController.getAlarms,
);

alarmsRouter.post(
	'/:id/reconhecer',
	authJwtheader,
	alarmsController.acknowledgeAlarm,
);