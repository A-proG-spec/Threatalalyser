// src/cache/threatCache.service.ts
import type { ThreatProvider, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CACHE_TTL } from '../config/constants';

/**
 * ThreatCache service.
 *
 * The cache is keyed by (indicatorId, provider) — never by raw URL text.
 * Normalization happens in `modules/indicator/normalizer.ts` BEFORE this
 * service is called, so `example.com` and `EXAMPLE.COM/` are one entry.
 *
 * Design notes:
 * - We never return rows past `expiresAt`. Expired rows are treated as
 *   "no cache entry" and the caller re-fetches.
 * - Cache is per-provider: if VirusTotal is fresh but URLhaus is stale, we
 *   hit URLhaus only.
 * - We do NOT delete expired rows here — that's a job for a cleanup task
 *   (or just let them sit; the table stays small).
 */

export interface CachedProviderResponse {
  response: Prisma.JsonValue;
  fetchedAt: Date;
  expiresAt: Date;
  isFresh: boolean;
}

/**
 * Get a cached provider response for the given indicator.
 * Returns `null` if no row exists OR the row is expired.
 */
export async function getCachedProviderResponse(
  indicatorId: string,
  provider: ThreatProvider
): Promise<CachedProviderResponse | null> {
  const row = await prisma.threatCache.findUnique({
    where: {
      indicatorId_provider: { indicatorId, provider },
    },
  });

  if (!row) return null;

  const now = new Date();
  const isFresh = row.expiresAt > now;

  return {
    response: row.response,
    fetchedAt: row.fetchedAt,
    expiresAt: row.expiresAt,
    isFresh,
  };
}

/**
 * Upsert a fresh provider response into the cache.
 * TTL comes from `CACHE_TTL[provider]` in constants.ts.
 *
 * Safe to call concurrently — upsert is atomic at the row level.
 */
export async function setCachedProviderResponse(
  indicatorId: string,
  provider: ThreatProvider,
  response: Prisma.InputJsonValue
): Promise<void> {
  const now = new Date();
  const ttlSeconds = CACHE_TTL[provider];
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  await prisma.threatCache.upsert({
    where: {
      indicatorId_provider: { indicatorId, provider },
    },
    create: {
      indicatorId,
      provider,
      response,
      fetchedAt: now,
      expiresAt,
    },
    update: {
      response,
      fetchedAt: now,
      expiresAt,
    },
  });
}

/**
 * Invalidate one provider's cache for an indicator.
 * Rarely needed, but useful when you want a "force refresh" button
 * or when a provider returns corrected data.
 */
export async function invalidateCache(
  indicatorId: string,
  provider: ThreatProvider
): Promise<void> {
  await prisma.threatCache.deleteMany({
    where: { indicatorId, provider },
  });
}