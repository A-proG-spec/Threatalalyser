// src/modules/investigation/investigation.routes.ts
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { investigationLimiter } from '../../middleware/rateLimiter';
import { CreateInvestigationSchema } from './investigation.schema';
import {
  createInvestigationHandler,
  getInvestigationHandler,
} from './investigation.controller';

export const investigationRouter = Router();

/**
 * POST /api/investigations
 *
 * Anonymous investigations ARE allowed (`optionalAuth`) — this is a
 * deliberate product decision: a user should be able to try the tool
 * before signing up. Anonymous investigations are stored with
 * `userId = null` (see investigation.service.ts). Signed-in users'
 * investigations appear in their history; anonymous ones do not.
 *
 * Rate-limited at 10/min per IP because each request costs 2–3 provider
 * API calls against your quota.
 */
investigationRouter.post(
  '/',
  optionalAuth,
  investigationLimiter,
  validate({ body: CreateInvestigationSchema }),
  createInvestigationHandler
);

/**
 * GET /api/investigations/:id
 * Requires auth — this is the "look up a report I already created" endpoint.
 */
investigationRouter.get('/:id', requireAuth, getInvestigationHandler);