// src/types/index.ts

export type RiskLevel = 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InvestigationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
export type IndicatorType = 'URL' | 'DOMAIN' | 'IP';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ThreatIndicator {
  id: string;
  type: IndicatorType;
  originalValue: string;
  normalizedValue: string;
  firstSeenAt: string;
  lastInvestigatedAt: string;
}

export interface ProviderResult {
  id: string;
  provider: 'VIRUSTOTAL' | 'URLHAUS' | 'ABUSEIPDB';
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RATE_LIMITED' | 'SKIPPED';
  normalizedData: any | null; // JSON from backend
  detectionCount: number | null;
  totalEngines: number | null;
  errorMessage: string | null;
  cacheHit: boolean;
}

export interface RiskAssessment {
  id: string;
  score: number;
  level: RiskLevel;
  explanation: {
    humanReadableSummary: string;
    rules: { provider: string; points: number; reason: string }[];
    missingDataPenalty: boolean;
    corroborationBonusApplied: boolean;
  };
  algorithmVersion: string;
  createdAt: string;
}

export interface Investigation {
  id: string;
  status: InvestigationStatus;
  riskScore: number | null;
  riskLevel: RiskLevel;
  summary: string | null;
  createdAt: string;
  completedAt: string | null;
}

// This is the main payload returned by POST /api/investigations
export interface InvestigationReport {
  investigation: Investigation;
  indicator: ThreatIndicator;
  providerResults: ProviderResult[];
  assessment: RiskAssessment;
}