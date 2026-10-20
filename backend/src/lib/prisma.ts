// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';


/**
 * Hot-reload-safe PrismaClient singleton.
 *
 * In development with ts-node-dev, module state is re-created on every file
 * save. Without this pattern, each reload creates a new connection pool and
 * Postgres runs out of slots after ~10 saves.
 *
 * In production we still use one shared instance — no global needed because
 * the process starts once and stays up.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}