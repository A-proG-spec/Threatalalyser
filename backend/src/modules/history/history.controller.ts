// src/modules/history/history.controller.ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import * as historyService from './history.service';

const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * GET /api/history?page=1&pageSize=20
 * Requires auth. Lists the calling user's investigations.
 */
export const listHistoryHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page, pageSize } = ListQuerySchema.parse(req.query);
    const result = await historyService.listInvestigationHistory(
      userId,
      page,
      pageSize
    );
    res.status(200).json(result);
  }
);

/**
 * GET /api/history/:investigationId
 * Full report for one investigation. 404 if not owned by caller.
 */
export const getHistoryDetailHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { investigationId } = req.params;
    const detail = await historyService.getInvestigationDetail(
      String(investigationId),
      userId
    );
    res.status(200).json(detail);
  }
);

/**
 * GET /api/history/indicator/:indicatorId/timeline
 * All of the caller's investigations of the same indicator, sorted by time.
 * Used to render the "risk over time" chart.
 */
export const getIndicatorTimelineHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { indicatorId } = req.params;
    const timeline = await historyService.getIndicatorTimeline(
      userId,
      String(indicatorId)
    );
    res.status(200).json(timeline);
  }
);