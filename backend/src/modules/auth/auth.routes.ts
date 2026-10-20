// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { registerHandler, loginHandler, meHandler } from './auth.controller';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Rate-limited (5 per 15 min) to prevent mass account creation.
 */
authRouter.post(
  '/register',
  authLimiter,
  validate({ body: RegisterSchema }),
  registerHandler
);

/**
 * POST /api/auth/login
 * Rate-limited (5 per 15 min) to block brute force.
 */
authRouter.post(
  '/login',
  authLimiter,
  validate({ body: LoginSchema }),
  loginHandler
);

/**
 * GET /api/auth/me
 * Requires a valid JWT. No rate limiter — this is cheap and used on
 * every page load.
 */
authRouter.get('/me', requireAuth, meHandler);