// src/modules/auth/auth.schema.ts
import { z } from 'zod';

/**
 * Register payload.
 * - email is normalized to lowercase so uniqueness is case-insensitive.
 * - password gets a minimum length (8) — a weak policy but reasonable for
 *   a graduation project. The frontend enforces the same rule.
 */
export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  name: z.string().trim().min(1).max(100).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Login payload.
 * Note: password has NO min length here — an attacker's probe shouldn't
 * get free intel about our password policy from validation errors.
 */
export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;