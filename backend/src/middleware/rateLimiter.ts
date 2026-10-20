// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Global limiter — every request.
 * 100 requests per minute per IP. Generous but catches abuse.
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT',
    },
  },
});

/**
 * Auth limiter — login/register.
 * 5 attempts per 15 minutes per IP. Brute-force protection.
 * Skip in test env so tests don't flake.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many authentication attempts. Try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT',
    },
  },
  skipSuccessfulRequests: false,
});

/**
 * Investigation limiter.
 * Each investigation fires 2–3 provider calls. Quotas are the real cost,
 * so this limiter protects YOUR budget, not just uptime.
 * 10 investigations per minute per IP.
 */
export const investigationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many investigations. Please wait a minute between bursts.',
      code: 'INVESTIGATION_RATE_LIMIT',
    },
  },
});