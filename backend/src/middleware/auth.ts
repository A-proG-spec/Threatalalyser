// src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export interface AuthPayload {
  sub: string;   // user id
  email: string;
}

/**
 * Read the bearer token from the Authorization header.
 * Returns null if absent or malformed.
 */
function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

/**
 * Verify a JWT and return its payload, or throw an ApiError.
 */
function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as Record<string, unknown>).sub !== 'string' ||
      typeof (decoded as Record<string, unknown>).email !== 'string'
    ) {
      throw new ApiError(401, 'Invalid token payload', 'INVALID_TOKEN');
    }
    return {
      sub: (decoded as Record<string, unknown>).sub as string,
      email: (decoded as Record<string, unknown>).email as string,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Token expired', 'TOKEN_EXPIRED');
    }
    throw new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
  }
}

/**
 * Hard authentication — request is rejected if no valid token.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    next(new ApiError(401, 'Authentication required', 'AUTH_REQUIRED'));
    return;
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Soft authentication — attaches req.user if a valid token is present,
 * otherwise continues anonymously. Useful for "anonymous investigations
 * with limited history".
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
  } catch {
    // Invalid/expired token — treat as anonymous, don't fail
  }
  next();
}