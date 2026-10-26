// src/modules/auth/auth.controller.ts
import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import type { RegisterInput, LoginInput } from './auth.schema';

export const registerHandler = asyncHandler(
  async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }
);

export const loginHandler = asyncHandler(
  async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  }
);

export const meHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    res.status(200).json({ user });
  }
);

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = UpdateProfileSchema.parse(req.body);
  const user = await authService.updateProfile(req.user!.id, data);
  res.status(200).json({ user });
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  res.status(200).json({ message: 'Password updated successfully' });
});