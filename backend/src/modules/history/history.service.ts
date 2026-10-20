// src/modules/history/history.service.ts
import type {
  Investigation,
  ProviderResult,
  RiskAssessment,
  ThreatIndicator,
} from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

/**
 * Paginated summary of a user's past investigations.
 * Returns lightweight rows — no provider results, no risk explanation —
 * so the history page loads fast even for prolific users.
 */
export interface InvestigationListItem {
  id: string;
  status: Investigation['status'];
  riskScore: number | null;
  riskLevel: Investigation['riskLevel'];
  summary: string | null;
  createdAt: Date;
  completedAt: Date | null;
  indicator: Pick<ThreatIndicator, 'id' | 'type' | 'normalizedValue' | 'originalValue'>;
}

export interface PaginatedHistory {
  items: InvestigationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * List investigations for a user, newest first.
 * Enforces page bounds so a caller can't ask for 10 million rows.
 */
export async function listInvestigationHistory(
  userId: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedHistory> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const skip = (safePage - 1) * safeSize;

  const [items, total] = await Promise.all([
    prisma.investigation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeSize,
      select: {
        id: true,
        status: true,
        riskScore: true,
        riskLevel: true,
        summary: true,
        createdAt: true,
        completedAt: true,
        indicator: {
          select: {
            id: true,
            type: true,
            normalizedValue: true,
            originalValue: true,
          },
        },
      },
    }),
    prisma.investigation.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}

/**
 * Full report for one investigation.
 * Includes provider results, indicator, and EVERY risk assessment
 * (so the UI can render "score history" for this specific investigation,
 * e.g. after a manual re-run).
 *
 * Ownership check: 404 if investigation belongs to another user.
 */
export interface InvestigationDetail {
  investigation: Investigation;
  indicator: ThreatIndicator;
  providerResults: ProviderResult[];
  assessments: RiskAssessment[];
}

export async function getInvestigationDetail(
  investigationId: string,
  userId: string
): Promise<InvestigationDetail> {
  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
    include: {
      indicator: true,
      providerResults: { orderBy: { provider: 'asc' } },
      assessments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!investigation) {
    throw new ApiError(404, 'Investigation not found', 'INVESTIGATION_NOT_FOUND');
  }
  if (investigation.userId !== userId) {
    // Same 404 as not-found so we don't leak existence to the wrong user
    throw new ApiError(404, 'Investigation not found', 'INVESTIGATION_NOT_FOUND');
  }

  const { indicator, providerResults, assessments, ...rest } = investigation;
  return {
    investigation: rest,
    indicator,
    providerResults,
    assessments,
  };
}

/**
 * Compare all investigations of the same indicator by this user.
 * This is the "see how a domain's reputation changed over time" view
 * from the spec. Sorted newest-first.
 *
 * Returns a compact timeline — the frontend renders this as a chart.
 */
export interface IndicatorTimelinePoint {
  investigationId: string;
  createdAt: Date;
  riskScore: number | null;
  riskLevel: Investigation['riskLevel'];
  status: Investigation['status'];
}

export interface IndicatorTimeline {
  indicator: Pick<
    ThreatIndicator,
    'id' | 'type' | 'normalizedValue' | 'originalValue' | 'firstSeenAt'
  >;
  points: IndicatorTimelinePoint[];
}

export async function getIndicatorTimeline(
  userId: string,
  indicatorId: string
): Promise<IndicatorTimeline> {
  const indicator = await prisma.threatIndicator.findUnique({
    where: { id: indicatorId },
    select: {
      id: true,
      type: true,
      normalizedValue: true,
      originalValue: true,
      firstSeenAt: true,
    },
  });

  if (!indicator) {
    throw new ApiError(404, 'Indicator not found', 'INDICATOR_NOT_FOUND');
  }

  const investigations = await prisma.investigation.findMany({
    where: { userId, indicatorId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      riskScore: true,
      riskLevel: true,
      status: true,
    },
  });

  // If this user has never investigated the indicator, treat it as 404
  // (do not leak that the indicator exists in the system from another user).
  if (investigations.length === 0) {
    throw new ApiError(404, 'Indicator not found', 'INDICATOR_NOT_FOUND');
  }

  return {
    indicator,
    points: investigations.map((i) => ({
      investigationId: i.id,
      createdAt: i.createdAt,
      riskScore: i.riskScore,
      riskLevel: i.riskLevel,
      status: i.status,
    })),
  };
}