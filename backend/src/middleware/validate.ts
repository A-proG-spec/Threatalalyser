// src/middleware/validate.ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Zod validation middleware.
 *
 * After validation, the parsed values REPLACE the raw ones on the request.
 * This means controllers get typed, coerced, and sanitized input
 * — no `parseInt(req.query.page)` nonsense.
 *
 * Failures throw ZodError, which `errorHandler` turns into a 400 with
 * per-field details.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        // req.query is read-only in Express 5 — reassign via defineProperty
        const parsed = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.defineProperty(req, 'params', {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}