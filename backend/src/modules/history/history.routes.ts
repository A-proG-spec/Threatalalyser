// src/modules/history/history.routes.ts
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  listHistoryHandler,
  getHistoryDetailHandler,
  getIndicatorTimelineHandler,
  getStatsHandler, // <-- Import the new handler
} from './history.controller';

export const historyRouter = Router();

historyRouter.use(requireAuth);

// Dashboard stats route must go FIRST so it doesn't get matched as an ID
historyRouter.get('/stats', getStatsHandler);

historyRouter.get('/', listHistoryHandler);

historyRouter.get(
  '/indicator/:indicatorId/timeline',
  getIndicatorTimelineHandler
);

historyRouter.get('/:investigationId', getHistoryDetailHandler);