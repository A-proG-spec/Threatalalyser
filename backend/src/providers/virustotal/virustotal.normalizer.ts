// src/providers/virustotal/virustotal.normalizer.ts
import type { IndicatorType } from '@prisma/client';
import type { NormalizedProviderResult } from '../../types/normalized';

export function normalizeVirusTotal(
  raw: any,
  type: IndicatorType
): NormalizedProviderResult {
  const attributes = raw.data?.attributes ?? {};
  const stats = attributes.last_analysis_stats ?? {};

  const malicious   = Number(stats.malicious   ?? 0);
  const suspicious  = Number(stats.suspicious  ?? 0);
  const harmless    = Number(stats.harmless    ?? 0);
  const undetected  = Number(stats.undetected  ?? 0);
  const timeout     = Number(stats.timeout     ?? 0);

  const detections   = malicious + suspicious;
  const totalEngines = malicious + suspicious + harmless + undetected + timeout;

  // Classify
  let verdict: NormalizedProviderResult['verdict'] = 'clean';
  if (malicious > 0)       verdict = 'malicious';
  else if (suspicious > 0) verdict = 'suspicious';
  else if (totalEngines === 0) verdict = 'unknown';

  // Confidence: 0–100, scaled by detection ratio
  const confidence =
    totalEngines > 0
      ? Math.min(100, Math.round((detections / totalEngines) * 100))
      : null;

  // Preserve only the engines that flagged it — keeps the JSON small
  // (the full last_analysis_results can be 70+ engines).
  const flaggedEngines: Record<string, string> = {};
  const allResults = attributes.last_analysis_results ?? {};
  for (const [engine, info] of Object.entries(allResults)) {
    const category = (info as any)?.category;
    if (category === 'malicious' || category === 'suspicious') {
      flaggedEngines[engine] = category;
    }
  }

  return {
    provider: 'VIRUSTOTAL',
    indicatorType: type,
    verdict,
    confidence,
    detections,
    totalEngines,
    lastAnalysisAt: attributes.last_analysis_date
      ? new Date(attributes.last_analysis_date * 1000)
      : null,
    evidence: {
      flaggedEngines,
      categories: attributes.categories ?? {},
      reputation: attributes.reputation ?? null,
      // Preserve raw stats for the UI to display "3/70 engines flagged"
      stats: {
        malicious,
        suspicious,
        harmless,
        undetected,
        timeout,
      },
    },
  };
}