import type { RiskLevel } from '@prisma/client';
import type { ProviderFetchOutcome } from '../types/normalized';
import { RISK_LEVEL_THRESHOLDS, RISK_WEIGHTS } from '../config/constants';
import { evaluateVirusTotal, evaluateUrlhaus, evaluateAbuseIPDB, type RuleResult } from './rules';
import { buildExplanation, type RiskExplanation } from './explanation';
import { extractMitreTechniques, type MitreTechnique } from './attack-mapping';
import { generateAISummary } from './ai-summary'; // We will create this next

export interface RiskCalculation {
  score: number;
  level: RiskLevel;
  explanation: RiskExplanation & { mitreTechniques: MitreTechnique[] };
  aiSummary: string | null;
}

export async function calculateRisk(
  outcomes: ProviderFetchOutcome[],
  indicatorValue: string
): Promise<RiskCalculation> {
  const rules: RuleResult[] = [];
  const missingProviders: string[] = [];
  const allTags: string[] = [];

  const byProvider = new Map(outcomes.map(o => [o.provider, o]));

  // ── Run Rules & Extract Tags ──
  const vtOutcome = byProvider.get('VIRUSTOTAL');
  if (vtOutcome?.status === 'SUCCESS') {
    const rule = evaluateVirusTotal(vtOutcome.normalized);
    if (rule) rules.push(rule);
  } else if (vtOutcome) missingProviders.push('VIRUSTOTAL');

  const uhOutcome = byProvider.get('URLHAUS');
  if (uhOutcome?.status === 'SUCCESS') {
    const rule = evaluateUrlhaus(uhOutcome.normalized);
    if (rule) rules.push(rule);
    // Extract tags for MITRE mapping
    if (uhOutcome.normalized?.evidence?.tags) {
      allTags.push(...uhOutcome.normalized.evidence.tags);
    }
  } else if (uhOutcome) missingProviders.push('URLHAUS');

  const apiOutcome = byProvider.get('ABUSEIPDB');
  if (apiOutcome?.status === 'SUCCESS') {
    const rule = evaluateAbuseIPDB(apiOutcome.normalized);
    if (rule) rules.push(rule);
    // Extract tags/usage types for MITRE mapping
    if (apiOutcome.normalized?.evidence?.usageType) {
      allTags.push(apiOutcome.normalized.evidence.usageType);
    }
  } else if (apiOutcome) missingProviders.push('ABUSEIPDB');

  // ── Sum Points ──
  let totalScore = rules.reduce((sum, rule) => sum + rule.points, 0);
  const flaggingCount = rules.filter(r => r.points > 0).length;
  const hasCorroboration = flaggingCount >= 2;
  if (hasCorroboration) totalScore += RISK_WEIGHTS.CORROBORATION_BONUS;
  totalScore = Math.max(0, Math.min(100, totalScore));

  // ── Map to RiskLevel ──
  let level: RiskLevel = 'UNKNOWN';
  if (rules.length === 0 && missingProviders.length > 0) level = 'UNKNOWN';
  else if (totalScore === 0) level = 'LOW';
  else if (totalScore < RISK_LEVEL_THRESHOLDS.MEDIUM) level = 'LOW';
  else if (totalScore < RISK_LEVEL_THRESHOLDS.HIGH) level = 'MEDIUM';
  else if (totalScore < RISK_LEVEL_THRESHOLDS.CRITICAL) level = 'HIGH';
  else level = 'CRITICAL';

  // ── Build Explanation & MITRE ──
  const baseExplanation = buildExplanation(totalScore, rules, missingProviders, hasCorroboration);
  const mitreTechniques = extractMitreTechniques(allTags);
  
  const explanation = {
    ...baseExplanation,
    mitreTechniques,
  };

  // ── Generate AI Summary ──
  const aiSummary = await generateAISummary(indicatorValue, totalScore, level, rules, mitreTechniques);

  return {
    score: totalScore,
    level,
    explanation,
    aiSummary,
  };
}