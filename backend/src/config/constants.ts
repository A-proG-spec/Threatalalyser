// src/config/constants.ts
import { env } from './env';

/**
 * Cache TTLs per provider, in seconds.
 * These override env defaults only if you want hard-coded fallbacks —
 * by default we read from env so deployments can tune without a rebuild.
 */
export const CACHE_TTL: Record<'VIRUSTOTAL' | 'URLHAUS' | 'ABUSEIPDB', number> = {
  VIRUSTOTAL: env.CACHE_TTL_VIRUSTOTAL,
  URLHAUS: env.CACHE_TTL_URLHAUS,
  ABUSEIPDB: env.CACHE_TTL_ABUSEIPDB,
};

/**
 * Per-provider HTTP timeout, in milliseconds.
 * A slow provider must not stall the whole investigation — we abort and mark
 * the ProviderResult as TIMEOUT so the report can still complete as PARTIAL.
 */
export const PROVIDER_TIMEOUT_MS = 10_000;

/**
 * Risk-scoring weights (0–100 scale, per evidence source).
 * These are placeholders — you'll refine them in `risk/rules.ts`.
 * Documented here so the scoring engine and your defense slides agree.
 */
export const RISK_WEIGHTS = {
  VIRUSTOTAL: {
    // VirusTotal returns detectionCount / totalEngines.
    // We weight the *ratio*, not raw count, so a 5/60 hit on a clean file
    // doesn't outrank a 40/60 hit on a shady one.
    maxContribution: 40,
  },
  URLHAUS: {
    // URLhaus is binary-ish: listed or not.
    // Being listed is a strong signal (known malware distribution URL).
    maxContribution: 45,
  },
  ABUSEIPDB: {
    // AbuseIPDB returns a confidence score 0-100.
    // We scale it into this contribution.
    maxContribution: 30,
  },
  CORROBORATION_BONUS: 10, // If 2+ providers flag the same indicator
} as const;

/**
 * Thresholds that map a numeric score (0–100) to a RiskLevel enum.
 * Kept in one place so `risk/engine.ts` and the frontend agree.
 */
export const RISK_LEVEL_THRESHOLDS = {
  LOW: 25,        // 0–24  → LOW
  MEDIUM: 50,     // 25–49 → MEDIUM
  HIGH: 75,       // 50–74 → HIGH
  CRITICAL: 100,  // 75–100 → CRITICAL
} as const;

/**
 * The version string of the current risk algorithm.
 * Persisted on every RiskAssessment row so you can compare scores over time
 * and say "this score used algorithm 1.0.0" in your defense.
 * Bump this whenever you change weights or rules.
 */
export const RISK_ALGORITHM_VERSION = '1.0.0';