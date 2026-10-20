// src/types/normalized.ts
import type { IndicatorType, ThreatProvider } from '@prisma/client';

/**
 * The normalized result every provider must produce.
 *
 * Design principle: providers return wildly different JSON. Each provider's
 * `.normalizer.ts` maps its raw response into THIS shape. From that point on,
 * the rest of the app only ever sees this shape.
 *
 * The `evidence` field preserves provider-specific detail (never lose
 * source data — you'll want it for the report UI), while the top-level
 * fields are what the risk engine actually reads.
 */

export type NormalizedVerdict =
  | 'malicious'
  | 'suspicious'
  | 'clean'
  | 'unknown';

export interface NormalizedProviderResult {
  provider: ThreatProvider;
  indicatorType: IndicatorType;

  /**
   * The unified verdict after interpreting the provider's response.
   * This is what the risk engine compares across providers to award
   * a corroboration bonus.
   */
  verdict: NormalizedVerdict;

  /**
   * 0–100 "confidence that this indicator is malicious" — each provider
   * expresses it differently, but the normalizer scales them all to this
   * range so the engine can combine them.
   * Null if the provider returned no usable signal.
   */
  confidence: number | null;

  /**
   * Detection count / total engines, when applicable.
   * VirusTotal: detections / engines.
   * URLhaus:    (listed ? 1 : 0) / 1.
   * AbuseIPDB:  (confidence / 100) * reports count — but we surface
   *             confidence separately above; this pair stays useful for
   *             showing "5/60 engines flagged" in the UI.
   */
  detections: number | null;
  totalEngines: number | null;

  /**
   * Timestamp when the provider's data was last updated
   * (VirusTotal's `last_analysis_date`, URLhaus's `date_added`, etc.).
   * Tells the UI how stale the data is.
   */
  lastAnalysisAt: Date | null;

  /**
   * Provider-specific evidence preserved for the UI.
   * Never parsed by the risk engine — only shown in the report.
   * Example for VirusTotal:
   *   { engines: { "Fortinet": "malicious", "Kaspersky": "clean", ... } }
   * Example for URLhaus:
   *   { urlhaus_reference: "https://urlhaus.abuse.ch/...", tags: ["emotet"] }
   */
  evidence: Record<string, unknown>;

  /**
   * Anything worth noting about how the normalizer interpreted the result.
   * Example: "Provider returned no data for this indicator type".
   * Shown under "Source notes" in the report UI.
   */
  notes?: string;
}

/**
 * Convenience wrapper used by `investigation.service.ts` to track a
 * provider's HTTP fetch status alongside its normalized result (if any).
 * Mirrors the `ProviderResult` table row in memory.
 */
export interface ProviderFetchOutcome {
  provider: ThreatProvider;
  /** SUCCESS, FAILED, TIMEOUT, RATE_LIMITED, SKIPPED */
  status:
    | 'SUCCESS'
    | 'FAILED'
    | 'TIMEOUT'
    | 'RATE_LIMITED'
    | 'SKIPPED';
  normalized: NormalizedProviderResult | null;
  raw: unknown | null;
  errorCode?: string;
  errorMessage?: string;
  /** True if the response came from ThreatCache, not the live provider. */
  fromCache: boolean;
  /** Time the fetch started, for latency stats. */
  fetchStartedAt: Date;
  /** Time the fetch resolved (success or fail). */
  fetchFinishedAt: Date;
}