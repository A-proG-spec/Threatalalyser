// src/risk/rules.ts
import type { NormalizedProviderResult } from '../types/normalized';
import { RISK_WEIGHTS } from '../config/constants';

export interface RuleResult {
  provider: string;
  points: number;
  reason: string;
}

/**
 * Evaluate VirusTotal.
 * We weight the detection ratio (e.g. 3/70) to avoid an IP with 1/90
 * detections getting the same score as one with 40/90.
 */
export function evaluateVirusTotal(
  data: NormalizedProviderResult | null
): RuleResult | null {
  if (!data || data.confidence === null) return null;

  let points = 0;
  let reason = 'No detections';

  if (data.verdict === 'malicious') {
    // Confidence is 0-100 (ratio of detections). 
    // We scale it up to the max weight for this provider (40).
    points = Math.round((data.confidence / 100) * RISK_WEIGHTS.VIRUSTOTAL.maxContribution);
    // Ensure at least 10 points if at least one engine flagged it
    points = Math.max(10, points);
    reason = `${data.detections}/${data.totalEngines} engines flagged as malicious/suspicious`;
  } else if (data.verdict === 'suspicious') {
    points = 10;
    reason = 'Flagged as suspicious by some engines';
  } else if (data.verdict === 'clean') {
    points = 0;
    reason = `Clean across ${data.totalEngines} engines`;
  }

  return {
    provider: 'VIRUSTOTAL',
    points,
    reason,
  };
}

/**
 * Evaluate URLhaus.
 * URLhaus is binary. If it's in their database, it's distributing malware.
 */
export function evaluateUrlhaus(
  data: NormalizedProviderResult | null
): RuleResult | null {
  if (!data) return null;

  if (data.verdict === 'malicious') {
    return {
      provider: 'URLHAUS',
      points: RISK_WEIGHTS.URLHAUS.maxContribution,
      reason: 'URL/Host is listed in malware distribution database',
    };
  }

  return {
    provider: 'URLHAUS',
    points: 0,
    reason: 'Not found in malware database',
  };
}

/**
 * Evaluate AbuseIPDB.
 * AbuseIPDB gives a confidence score from 0-100 directly.
 */
export function evaluateAbuseIPDB(
  data: NormalizedProviderResult | null
): RuleResult | null {
  if (!data || data.confidence === null) return null;

  let points = 0;
  let reason = 'No abuse reports';

  if (data.confidence >= 75) {
    points = RISK_WEIGHTS.ABUSEIPDB.maxContribution;
    reason = `High confidence abuse score (${data.confidence}/100) from ${data.detections} reports`;
  } else if (data.confidence >= 25) {
    points = Math.round((data.confidence / 100) * RISK_WEIGHTS.ABUSEIPDB.maxContribution);
    reason = `Suspicious activity score (${data.confidence}/100) from ${data.detections} reports`;
  } else if (data.confidence > 0) {
    points = 5;
    reason = `Low confidence abuse score (${data.confidence}/100)`;
  }

  return {
    provider: 'ABUSEIPDB',
    points,
    reason,
  };
}