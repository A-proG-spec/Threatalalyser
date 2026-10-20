// src/modules/investigation/investigation.controller.ts
import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as investigationService from './investigation.service';
import type { CreateInvestigationInput } from './investigation.schema';

/**
 * POST /api/investigations
 * Body: { indicator: "example.com" }
 *
 * Returns the full investigation report:
 * {
 *   investigation: { id, status, riskScore, riskLevel, summary, ... },
 *   indicator: { id, type, originalValue, normalizedValue, ... },
 *   providerResults: [...],       // one per provider, including failures
 *   assessment: { score, level, explanation, algorithmVersion, ... }
 * }
 *
 * Synchronous from the client's perspective — the service blocks until
 * providers respond or time out, then returns the complete report. If you
 * later move to background jobs, this endpoint would return 202 + job id
 * instead, but the MVP is synchronous and that's fine.
 */
export const createInvestigationHandler = asyncHandler(
  async (req: Request<{}, {}, CreateInvestigationInput>, res: Response) => {
    const userId = req.user?.id ?? null;
    const result = await investigationService.runInvestigation(
      req.body.indicator,
      userId
    );
    res.status(201).json(result);
  }
);

/**
 * GET /api/investigations/:id
 * Fetch a previously-run investigation by id (owner check enforced).
 * Kept here for convenience — the same data is also available via
 * /api/history/:id.
 */
export const getInvestigationHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await investigationService.getInvestigationById(String(id), userId);
    res.status(200).json(result);
  }
);