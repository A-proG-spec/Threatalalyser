// src/lib/logger.ts
import pino from 'pino';
import { env } from '../config/env';

/**
 * Pino instance.
 *
 * Dev:  human-readable, colorized (via pino-pretty if available)
 * Prod: raw JSON lines, suitable for Loki / Datadog / CloudWatch
 *
 * `redact` prevents accidental logging of tokens, cookies, and the
 * provider API keys — a very real footgun when you log raw provider responses.
 */
export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordHash',
      '*.password',
      '*.passwordHash',
      '*.apiKey',
      '*.API_KEY',
    ],
    censor: '[REDACTED]',
  },
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});

/**
 * Optional: pino-http instance for Express request logging.
 * Imported by app.ts. Kept in a separate export so you can also use
 * the bare `logger` inside services without request context.
 */
export { pino };