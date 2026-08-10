import { Router } from 'express';
import * as banksController from './banks.controller.js';
import { authJwtheader } from '../auth/auth.middleware.js';
import { validateQueryMiddleware } from '../middleware/validate-schema.js';
import { ReadingsQuerySchema } from './bank.types.js';

export const banksRouter = Router({ mergeParams: true }) as Router;

banksRouter.get(
	'/:id/leituras',
	validateQueryMiddleware(ReadingsQuerySchema),
	authJwtheader,
	banksController.getBankReadings,
);