// src/modules/history/history.routes.ts
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  listHistoryHandler,
  getHistoryDetailHandler,
  getIndicatorTimelineHandler,
} from './history.controller';

export const historyRouter = Router();

/**
 * Every history route requires authentication.
 * Applying `requireAuth` at the router level means we can never
 * accidentally ship a public history endpoint.
 */
historyRouter.use(requireAuth);

/**
 * GET /api/history
 * Paginated list of the user's investigations.
 */
historyRouter.get('/', listHistoryHandler);

/**
 * GET /api/history/indicator/:indicatorId/timeline
 * MUST be registered BEFORE '/:investigationId' — Express matches
 * routes in order, and '/:investigationId' would swallow 'indicator'
 * as an id. Route order is not cosmetic; it's correctness.
 */
historyRouter.get(
  '/indicator/:indicatorId/timeline',
  getIndicatorTimelineHandler
);

/**
 * GET /api/history/:investigationId
 * Full detail of one investigation.
 */
historyRouter.get('/:investigationId', getHistoryDetailHandler);