// src/modules/auth/auth.controller.ts
import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import type { RegisterInput, LoginInput } from './auth.schema';

/**
 * POST /api/auth/register
 * Body already validated by `validate({ body: RegisterSchema })`.
 * Returns 201 with the new user + token.
 */
export const registerHandler = asyncHandler(
  async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }
);

/**
 * POST /api/auth/login
 * Returns 200 with user + token.
 * 401 on bad credentials (same error for unknown-email and wrong-password).
 */
export const loginHandler = asyncHandler(
  async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }
);

/**
 * GET /api/auth/me
 * Requires `requireAuth` middleware — `req.user` is guaranteed present.
 * Returns the current user's profile.
 */
export const meHandler = asyncHandler(
  async (req: Request, res: Response) => {
    // `requireAuth` guarantees req.user is set. The non-null assertion is
    // safe here — we can't reach this handler without it.
    const userId = req.user!.id;
    const user = await authService.getCurrentUser(userId);
    res.status(200).json({ user });
  }
);