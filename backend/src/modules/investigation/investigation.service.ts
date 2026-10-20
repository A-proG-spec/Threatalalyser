import type {
  Investigation,
  ProviderResult,
  RiskAssessment,
  ThreatIndicator,
  InvestigationStatus,
  ProviderStatus,
  RiskLevel,
  Prisma,
} from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { ApiError } from '../../utils/ApiError';
import { withTimeout, isTimeoutError } from '../../utils/timeouts';
import { PROVIDER_TIMEOUT_MS } from '../../config/constants';
import { normalizeIndicator } from '../indicator/normalizer';
import { findOrCreateIndicator } from '../indicator/indicator.service';
import { runAllProviders } from '../../providers';
import type { ProviderFetchOutcome } from '../../types/normalized';
import { calculateRisk } from '../../risk/engine';

export interface InvestigationReport {
  investigation: Investigation;
  indicator: ThreatIndicator;
  providerResults: ProviderResult[];
  assessment: RiskAssessment;
}

/**
 * Get the system "Anonymous" user ID.
 * If it doesn't exist (e.g. first boot), it creates it.
 */
async function getAnonymousUserId(): Promise<string> {
  const email = 'anonymous@threatlens.system';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Anonymous System User',
        passwordHash: 'not-a-real-hash-login-disabled', // Cannot login with this
      },
    });
  }
  return user.id;
}

export async function runInvestigation(
  rawIndicator: string,
  userId: string | null
): Promise<InvestigationReport> {
  // ── Step 1: normalize ─────────────────────────────────────
  const normalized = normalizeIndicator(rawIndicator);

  // ── Step 2: find-or-create indicator ──────────────────────
  const indicator = await findOrCreateIndicator(normalized);

  // ── Step 3: resolve user ID ───────────────────────────────
  // If the user is anonymous (null), we get the system user's ID.
  const effectiveUserId = userId || (await getAnonymousUserId());

  // ── Step 4: create Investigation row ──────────────────────
  const investigation = await prisma.investigation.create({
    data: {
      userId: effectiveUserId,
      indicatorId: indicator.id,
      status: 'PROCESSING',
      startedAt: new Date(),
    },
  });

  logger.info(
    { investigationId: investigation.id, indicatorId: indicator.id },
    'Investigation started'
  );

  // ── Step 5: run providers concurrently ───────────────────
  const outcomes = await Promise.all(
    runAllProviders(indicator, userId).map((p) =>
      withTimeout(p, PROVIDER_TIMEOUT_MS, 'Provider Fetch').catch(
        (err): ProviderFetchOutcome => {
          return {
            provider: 'VIRUSTOTAL', // Fallback
            status: isTimeoutError(err) ? 'TIMEOUT' : 'FAILED',
            normalized: null,
            raw: null,
            errorCode: err instanceof ApiError ? err.code : 'PROVIDER_ERROR',
            errorMessage: err instanceof Error ? err.message : String(err),
            fromCache: false,
            fetchStartedAt: new Date(),
            fetchFinishedAt: new Date(),
          };
        }
      )
    )
  );

  // ── Step 6: persist ProviderResult rows ──────────────────
  await persistProviderResults(investigation.id, outcomes);

  // ── Step 7: calculate risk (with AI & MITRE) ─────────────
  const { score, level, explanation, aiSummary } = await calculateRisk(
    outcomes,
    indicator.normalizedValue
  );

  const assessment = await prisma.riskAssessment.create({
    data: {
      investigationId: investigation.id,
      score,
      level,
      explanation: explanation as unknown as Prisma.InputJsonValue,
      aiSummary,
      algorithmVersion: '1.1.0',
    },
  });

  // ── Step 8: determine final status + summary ─────────────
  const { status, summary } = summarizeInvestigation(outcomes, score, level);

  const finished = await prisma.investigation.update({
    where: { id: investigation.id },
    data: {
      status,
      riskScore: score,
      riskLevel: level,
      summary,
      completedAt: new Date(),
    },
  });

  const providerResults = await prisma.providerResult.findMany({
    where: { investigationId: investigation.id },
    orderBy: { provider: 'asc' },
  });

  logger.info(
    { investigationId: investigation.id, status, score, level },
    'Investigation completed'
  );

  return {
    investigation: finished,
    indicator,
    providerResults,
    assessment,
  };
}

export async function getInvestigationById(
  investigationId: string,
  userId: string
): Promise<InvestigationReport> {
  const row = await prisma.investigation.findUnique({
    where: { id: investigationId },
    include: {
      indicator: true,
      providerResults: { orderBy: { provider: 'asc' } },
      assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!row || row.userId !== userId) {
    throw new ApiError(404, 'Investigation not found', 'INVESTIGATION_NOT_FOUND');
  }
  if (!row.assessments[0]) {
    throw new ApiError(500, 'Investigation has no risk assessment', 'NO_ASSESSMENT');
  }

  const { indicator, providerResults, assessments, ...investigation } = row;
  return {
    investigation,
    indicator,
    providerResults,
    assessment: assessments[0],
  };
}

async function persistProviderResults(
  investigationId: string,
  outcomes: ProviderFetchOutcome[]
): Promise<void> {
  if (outcomes.length === 0) return;

  await prisma.providerResult.createMany({
    data: outcomes.map((o) => ({
      investigationId,
      provider: o.provider,
      status: mapProviderStatus(o.status),
      rawResponse: (o.raw ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      normalizedData: (o.normalized ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      detectionCount: o.normalized?.detections ?? null,
      totalEngines: o.normalized?.totalEngines ?? null,
      errorCode: o.errorCode ?? null,
      errorMessage: o.errorMessage ?? null,
      cacheHit: o.fromCache,
      fetchedAt: o.fetchFinishedAt,
    })),
  });
}

function mapProviderStatus(
  s: ProviderFetchOutcome['status']
): ProviderStatus {
  switch (s) {
    case 'SUCCESS': return 'SUCCESS';
    case 'TIMEOUT': return 'TIMEOUT';
    case 'RATE_LIMITED': return 'RATE_LIMITED';
    case 'SKIPPED': return 'SKIPPED';
    case 'FAILED':
    default: return 'FAILED';
  }
}

function summarizeInvestigation(
  outcomes: ProviderFetchOutcome[],
  score: number,
  level: RiskLevel
): { status: InvestigationStatus; summary: string } {
  const attempted = outcomes.filter((o) => o.status !== 'SKIPPED');
  const succeeded = outcomes.filter((o) => o.status === 'SUCCESS');

  if (attempted.length === 0) {
    return {
      status: 'FAILED',
      summary: 'No providers were applicable for this indicator type.',
    };
  }
  if (succeeded.length === 0) {
    return {
      status: 'FAILED',
      summary: `All ${attempted.length} provider(s) failed to return data.`,
    };
  }

  const status: InvestigationStatus =
    succeeded.length === attempted.length ? 'COMPLETED' : 'PARTIAL';

  const sourceWord = succeeded.length === 1 ? 'source' : 'sources';
  const summary =
    `${level} risk (score ${score}/100) based on ${succeeded.length} ${sourceWord}` +
    (status === 'PARTIAL'
      ? `. ${attempted.length - succeeded.length} provider(s) unavailable.`
      : '.');

  return { status, summary };
}