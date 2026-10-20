// src/types/express.d.ts
import 'express';

/**
 * Module augmentation for Express's Request type.
 *
 * Because this is a `.d.ts` with `declare global`, TypeScript merges these
 * fields into the base `Request` type everywhere in the project — so
 * `req.user` is typed without any per-file casts.
 *
 * `user` is optional because `optionalAuth` middleware leaves it undefined
 * for anonymous requests. `requireAuth` sets it, and controllers on
 * protected routes can do `const { id } = req.user!` safely.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};