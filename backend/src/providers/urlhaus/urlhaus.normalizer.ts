// src/providers/urlhaus/urlhaus.normalizer.ts
import type { IndicatorType } from '@prisma/client';
import type { NormalizedProviderResult } from '../../types/normalized';

export function normalizeUrlhaus(
  raw: any,
  type: IndicatorType
): NormalizedProviderResult {
  // If query_status is "ok", it means we got data (it's in the database)
  const isListed = raw.query_status === 'ok';
  
  // For URLs, it returns the URL entry. For hosts, it returns a list of URLs.
  // If it's a host and there are URLs associated, it's malicious.
  const hasUrls = raw.urls && Array.isArray(raw.urls) && raw.urls.length > 0;
  const malicious = isListed || hasUrls;

  // URLhaus doesn't give a confidence score, it's binary. 
  // If it's there, it's 100% malicious.
  const confidence = malicious ? 100 : 0;
  
  return {
    provider: 'URLHAUS',
    indicatorType: type,
    verdict: malicious ? 'malicious' : 'clean',
    confidence,
    detections: malicious ? 1 : 0,
    totalEngines: 1,
    lastAnalysisAt: raw.date_added ? new Date(raw.date_added) : null,
    evidence: {
      // Keep the raw URL list or tags for the UI
      urls: raw.urls || [],
      tags: raw.tags || [],
    },
  };
}