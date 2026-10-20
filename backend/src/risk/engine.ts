import type { RiskLevel } from '@prisma/client';
import type { ProviderFetchOutcome } from '../types/normalized';
import { RISK_LEVEL_THRESHOLDS, RISK_WEIGHTS } from '../config/constants';
import {
  evaluateVirusTotal,
  evaluateUrlhaus,
  evaluateAbuseIPDB,
  type RuleResult,
} from './rules';
import { buildExplanation, type RiskExplanation } from './explanation';

export interface RiskCalculation {
  score: number;
  level: RiskLevel;
  explanation: RiskExplanation;
}

/**
 * Calculate the overall risk score from provider outcomes.
 * 
 * Rules:
 * 1. Sum up points from each provider's rule.
 * 2. Award a bonus if 2+ providers flag the same indicator.
 * 3. Cap at 100.
 * 4. Map score to RiskLevel enum.
 */
export function calculateRisk(
  outcomes: ProviderFetchOutcome[]
): RiskCalculation {
  const rules: RuleResult[] = [];
  const missingProviders: string[] = [];

  // Map outcomes by provider name for easy access
  const byProvider = new Map(outcomes.map(o => [o.provider, o]));

  // ── Run Rules ──
  const vtOutcome = byProvider.get('VIRUSTOTAL');
  if (vtOutcome?.status === 'SUCCESS') {
    const rule = evaluateVirusTotal(vtOutcome.normalized);
    if (rule) rules.push(rule);
  } else if (vtOutcome) missingProviders.push('VIRUSTOTAL');

  const uhOutcome = byProvider.get('URLHAUS');
  if (uhOutcome?.status === 'SUCCESS') {
    const rule = evaluateUrlhaus(uhOutcome.normalized);
    if (rule) rules.push(rule);
  } else if (uhOutcome) missingProviders.push('URLHAUS');

  const apiOutcome = byProvider.get('ABUSEIPDB');
  if (apiOutcome?.status === 'SUCCESS') {
    const rule = evaluateAbuseIPDB(apiOutcome.normalized);
    if (rule) rules.push(rule);
  } else if (apiOutcome) missingProviders.push('ABUSEIPDB');

  // ── Sum Points ──
  let totalScore = rules.reduce((sum, rule) => sum + rule.points, 0);

  // ── Corroboration Bonus ──
  // If 2 or more providers gave points (>0), award the bonus
  const flaggingCount = rules.filter(r => r.points > 0).length;
  const hasCorroboration = flaggingCount >= 2;
  if (hasCorroboration) {
    totalScore += RISK_WEIGHTS.CORROBORATION_BONUS;
  }

  // ── Cap & Floor ──
  // Never exceed 100. Never go below 0.
  totalScore = Math.max(0, Math.min(100, totalScore));

  // ── Map to RiskLevel ──
  let level: RiskLevel = 'UNKNOWN';
  if (totalScore === 0) level = 'LOW'; // clean
  else if (totalScore < RISK_LEVEL_THRESHOLDS.MEDIUM) level = 'LOW';
  else if (totalScore < RISK_LEVEL_THRESHOLDS.HIGH) level = 'MEDIUM';
  else if (totalScore < RISK_LEVEL_THRESHOLDS.CRITICAL) level = 'HIGH';
  else level = 'CRITICAL';

  // Special case: if all providers failed, it's UNKNOWN, not LOW.
  if (rules.length === 0 && missingProviders.length > 0) {
    level = 'UNKNOWN';
  }

  // ── Build Explanation ──
  const explanation = buildExplanation(totalScore, rules, missingProviders, hasCorroboration);

  return {
    score: totalScore,
    level,
    explanation,
  };
}