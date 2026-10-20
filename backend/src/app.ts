import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { globalLimiter } from './middleware/rateLimiter';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { statsRouter } from './modules/stats/stats.routes';

// Import Routers
import { authRouter } from './modules/auth/auth.routes';
import { investigationRouter } from './modules/investigation/investigation.routes';
import { historyRouter } from './modules/history/history.routes';

const app = express();

// ─── 1. Security & Utility Middleware ──────────────────────
// Helmet sets secure HTTP headers (XSS protection, no-sniff, etc.)
app.use(helmet());

// CORS — allows your React frontend to talk to this backend
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' // Replace later
    : 'http://localhost:5173',             // Vite default
  credentials: true,
}));

// Body parsers (limit to 1MB to prevent payload DOS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── 2. Logging ────────────────────────────────────────────
// pino-http logs every request/response
app.use(pinoHttp({ logger }));

// Morgan logs to the console in dev for easier reading (can remove this if pino is enough)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── 3. Rate Limiting ──────────────────────────────────────
// Applies a general limit to all routes to prevent abuse
app.use(globalLimiter);

// ─── 4. Health Check ───────────────────────────────────────
// A simple endpoint for monitoring tools (and you) to check if the API is alive
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// ─── 5. API Routes ─────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/investigations', investigationRouter);
app.use('/api/history', historyRouter);
app.use('/api/stats', statsRouter);

// ─── 6. Catch-All & Error Handling ─────────────────────────
// Must be LAST. Catches 404s and passes everything to the global error handler.
app.use(notFound);
app.use(errorHandler);

export { app };