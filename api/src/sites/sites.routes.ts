import { Router } from 'express';
import * as sitesController from './sites.controller.js';
import { authJwtheader } from '../auth/auth.middleware.js';

export const sitesRouter = Router({ mergeParams: true }) as Router;

sitesRouter.get(
	'/',
	authJwtheader,
	sitesController.getUserSites,
);

sitesRouter.get(
	'/:id/bancos',
	authJwtheader,
	sitesController.getSiteBanks,
);