// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { 
  registerHandler, 
  loginHandler, 
  meHandler,
  updateProfileHandler,
  changePasswordHandler
} from './auth.controller';

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: RegisterSchema }),
  registerHandler
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: LoginSchema }),
  loginHandler
);

authRouter.get('/me', requireAuth, meHandler);

authRouter.patch('/profile', requireAuth, updateProfileHandler);

authRouter.patch('/password', requireAuth, changePasswordHandler);