import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as statsService from './stats.service';

export const getGlobalStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await statsService.getGlobalStats();
  res.status(200).json(stats);
});