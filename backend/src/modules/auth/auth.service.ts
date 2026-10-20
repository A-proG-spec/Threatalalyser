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
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const row = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!row) {
    // Dummy compare to prevent timing attacks
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
    throw new ApiError(401, 'User no longer exists', 'USER_NOT_FOUND');
  }
  return user;
}

/**
 * Update user profile (name/email).
 */
export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<SafeUser> {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw new ApiError(409, 'Email already in use', 'EMAIL_TAKEN');
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

/**
 * Change password. Requires current password to verify identity.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'Incorrect current password', 'INVALID_PASSWORD');
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}

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