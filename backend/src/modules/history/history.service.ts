// src/modules/history/history.service.ts
import type {
  Investigation,
  ProviderResult,
  RiskAssessment,
  ThreatIndicator,
} from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';

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

  if (!investigation || investigation.userId !== userId) {
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

// ─────────────────────────────────────────────────────────────
// NEW: Dashboard Statistics
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalInvestigations: number;
  threatsDetected: number;
  safeInvestigations: number;
  recentInvestigations: InvestigationListItem[];
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [total, highRisk, lowRisk, recent] = await Promise.all([
    prisma.investigation.count({ where: { userId } }),
    prisma.investigation.count({
      where: { userId, riskLevel: { in: ['HIGH', 'CRITICAL'] } },
    }),
    prisma.investigation.count({
      where: { userId, riskLevel: { in: ['LOW', 'UNKNOWN'] } },
    }),
    prisma.investigation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
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
            originalValue: true 
          } 
        }
      }
    })
  ]);

  return {
    totalInvestigations: total,
    threatsDetected: highRisk,
    safeInvestigations: lowRisk,
    recentInvestigations: recent,
  };
}