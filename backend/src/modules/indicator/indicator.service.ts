// src/modules/indicator/indicator.service.ts
import type { ThreatIndicator } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import type { NormalizedIndicator } from './normalizer';

/**
 * Find or create a ThreatIndicator for the given normalized input.
 *
 * Deduplication guarantees:
 * - Two users investigating `example.com` share ONE ThreatIndicator row.
 * - Two users investigating `EXAMPLE.COM` and `example.com` share ONE row.
 * - The `@@unique([type, normalizedValue])` constraint enforces this at
 *   the database level, so even a race condition can't create duplicates.
 *
 * `lastInvestigatedAt` is bumped on every hit so the "recent indicators"
 * view sorts correctly.
 */
export async function findOrCreateIndicator(
  normalized: NormalizedIndicator
): Promise<ThreatIndicator> {
  const existing = await prisma.threatIndicator.findUnique({
    where: {
      type_normalizedValue: {
        type: normalized.type,
        normalizedValue: normalized.normalized,
      },
    },
  });

  if (existing) {
    // Update lastInvestigatedAt without returning the full row (cheaper)
    await prisma.threatIndicator.update({
      where: { id: existing.id },
      data: { lastInvestigatedAt: new Date() },
    });
    return existing;
  }

  try {
    return await prisma.threatIndicator.create({
      data: {
        type: normalized.type,
        originalValue: normalized.original,
        normalizedValue: normalized.normalized,
      },
    });
  } catch (err) {
    // Race condition: another request created it between our findUnique and
    // create. Retry the lookup — the unique constraint guarantees it exists.
    const now = new Date();
    const raced = await prisma.threatIndicator.findUnique({
      where: {
        type_normalizedValue: {
          type: normalized.type,
          normalizedValue: normalized.normalized,
        },
      },
    });
    if (raced) {
      logger.debug(
        { indicatorId: raced.id },
        'Indicator created concurrently; using existing row'
      );
      return raced;
    }
    throw err;
  }
}

/**
 * Fetch a ThreatIndicator by id.
 * Used by the investigation report to display original vs normalized form.
 */
export async function getIndicatorById(
  id: string
): Promise<ThreatIndicator | null> {
  return prisma.threatIndicator.findUnique({ where: { id } });
}