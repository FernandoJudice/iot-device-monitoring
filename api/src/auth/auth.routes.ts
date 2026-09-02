import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateBodyMiddleware } from '../middleware/validate-schema.js';
import { authLocal } from './auth.middleware.js';
import { SignInSchema } from './auth.types.js';

export const auth = Router({ mergeParams: true }) as Router;

auth.post(
	'/sign-in',
	validateBodyMiddleware(SignInSchema),
	authLocal,
	authController.onSignIn,
);