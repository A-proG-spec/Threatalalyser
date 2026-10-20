// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../lib/logger';
import { env } from '../config/env';

interface ErrorResponseBody {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * Centralized error handler.
 * Express detects this as an error handler because it has 4 params.
 * MUST be registered last, after all routes.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ErrorResponseBody>,
  _next: NextFunction
): void {
  // 1. Zod validation errors → 400 with field details
  if (err instanceof ZodError) {
    logger.warn({ path: req.path, issues: err.issues }, 'Validation error');
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  // 2. Our own ApiError → use its status/code
  if (err instanceof ApiError) {
    logger.warn(
      { path: req.path, status: err.status, code: err.code },
      err.message
    );
    res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // 3. Prisma known errors → map to sensible HTTP codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, code, message } = mapPrismaError(err);
    logger.error({ path: req.path, prismaCode: err.code }, message);
    res.status(status).json({ error: { message, code } });
    return;
  }

  // 4. Prisma validation errors (bad query shape)
  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error({ path: req.path }, 'Prisma validation error');
    res.status(400).json({
      error: {
        message: 'Invalid database query',
        code: 'PRISMA_VALIDATION_ERROR',
      },
    });
    return;
  }

  // 5. Anything else → 500, generic message, log full stack server-side
  const anyErr = err as { message?: string; stack?: string };
  logger.error(
    { path: req.path, err: { message: anyErr.message, stack: anyErr.stack } },
    'Unhandled error'
  );

  res.status(500).json({
    error: {
      message:
        env.NODE_ENV === 'production'
          ? 'Internal server error'
          : anyErr.message ?? 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(env.NODE_ENV !== 'production' && anyErr.stack
        ? { details: anyErr.stack }
        : {}),
    },
  });
}

/**
 * Map Prisma error codes to HTTP responses.
 * Reference: https://www.prisma.io/docs/orm/reference/error-reference
 */
function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
  status: number;
  code: string;
  message: string;
} {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      return {
        status: 409,
        code: 'UNIQUE_CONSTRAINT',
        message: 'A record with that value already exists',
      };
    case 'P2003':
      // Foreign key constraint
      return {
        status: 400,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Related record not found',
      };
    case 'P2025':
      // Record not found
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Record not found',
      };
    default:
      return {
        status: 500,
        code: 'PRISMA_ERROR',
        message: 'Database error',
      };
  }
}