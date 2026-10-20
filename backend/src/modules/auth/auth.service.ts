// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput } from './auth.schema';

const BCRYPT_ROUNDS = 12;

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
}

/**
 * Register a new user.
 * - Rejects duplicate emails with 409.
 * - Hashes password with bcrypt (cost 12 — ~250ms, deliberately slow to
 *   defeat brute force, but not so slow that login feels sluggish).
 * - Returns a JWT so the frontend doesn't need a second request.
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, 'Email already registered', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name ?? null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const token = signToken(user.id, user.email);
  return { user, token };
}

/**
 * Verify credentials and return a JWT.
 * Deliberately returns the SAME error (401 INVALID_CREDENTIALS) for
 * unknown-email and wrong-password cases — leaking "user exists but
 * password wrong" is a well-known enumeration attack.
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const row = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!row) {
    // Run a dummy bcrypt compare to avoid a timing side-channel that
    // reveals whether the email exists.
    await bcrypt.compare(
      input.password,
      '$2a$12$dummy.hash.for.timing.equivalence.only0000000000000000'
    ).catch(() => false);
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const ok = await bcrypt.compare(input.password, row.passwordHash);
  if (!ok) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const user: SafeUser = {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
  };
  const token = signToken(row.id, row.email);
  return { user, token };
}

/**
 * Fetch the currently authenticated user.
 * Used by `GET /api/auth/me`.
 */
export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    // Token was valid but user no longer exists (deleted account).
    throw new ApiError(401, 'User no longer exists', 'USER_NOT_FOUND');
  }
  return user;
}

/**
 * Sign a JWT with the standard claims we care about.
 * `sub` is the user id (JWT spec name for "subject").
 */
function signToken(userId: string, email: string): string {
  return jwt.sign(
    { email },
    env.JWT_SECRET,
    {
      subject: userId,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    }
  );
}