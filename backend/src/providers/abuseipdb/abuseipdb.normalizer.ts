// src/providers/abuseipdb/abuseipdb.normalizer.ts
import type { NormalizedProviderResult } from '../../types/normalized';

export function normalizeAbuseIPDB(raw: any): NormalizedProviderResult {
  const data = raw.data || {};
  const score = data.abuseConfidenceScore || 0;

  let verdict: NormalizedProviderResult['verdict'] = 'clean';
  if (score >= 75) verdict = 'malicious';
  else if (score >= 25) verdict = 'suspicious';

  return {
    provider: 'ABUSEIPDB',
    indicatorType: 'IP',
    verdict,
    confidence: score, // AbuseIPDB gives a 0-100 confidence score
    detections: data.totalReports || 0,
    totalEngines: null, // Not applicable
    lastAnalysisAt: data.lastReportedAt ? new Date(data.lastReportedAt) : null,
    evidence: {
      isp: data.isp,
      usageType: data.usageType,
      countryCode: data.countryCode,
      domain: data.domain,
    },
  };
}