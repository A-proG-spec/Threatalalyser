import { Router } from 'express';
import { getGlobalStatsHandler } from './stats.controller';

export const statsRouter = Router();
statsRouter.get('/', getGlobalStatsHandler);