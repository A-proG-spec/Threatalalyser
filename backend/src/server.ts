// src/server.ts
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

/**
 * Start the Express server.
 */
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`👉 http://localhost:${env.PORT}/health`);
});

/**
 * Graceful Shutdown.
 * When you hit Ctrl+C, or your hosting provider sends SIGTERM,
 * we stop accepting new requests, close the DB connection, and exit cleanly.
 * This prevents data corruption and "connection limit reached" errors on restart.
 */
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // 1. Stop accepting new HTTP requests
  server.close(async () => {
    logger.info('HTTP server closed');

    // 2. Disconnect Prisma
    await prisma.$disconnect();
    logger.info('Database connection closed');

    // 3. Exit process
    process.exit(0);
  });

  // Force shutdown if it takes too long (e.g. a hanging DB query)
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled rejections (promises without .catch())
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Promise Rejection');
});

// Catch uncaught exceptions (synchronous crashes)
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  // In production, you might want to crash and restart via PM2/Docker
  shutdown('uncaughtException');
});