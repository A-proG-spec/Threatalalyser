// src/risk/explanation.ts
import type { RuleResult } from './rules';

export interface RiskExplanation {
  totalScore: number;
  rules: RuleResult[];
  missingDataPenalty: boolean;
  corroborationBonusApplied: boolean;
  humanReadableSummary: string;
}

/**
 * Compile the final explanation object from the list of rules that ran.
 */
export function buildExplanation(
  score: number,
  rules: RuleResult[],
  missingProviders: string[],
  hasCorroboration: boolean
): RiskExplanation {
  // Build a text summary for quick display
  const flaggingSources = rules.filter(r => r.points > 0).map(r => r.provider);
  
  let summary = '';
  if (flaggingSources.length === 0) {
    summary = 'No malicious activity detected by available sources.';
  } else if (flaggingSources.length === 1) {
    summary = `Flagged by 1 source (${flaggingSources[0]}).`;
  } else {
    summary = `Corroborated by ${flaggingSources.length} independent sources (${flaggingSources.join(', ')}).`;
  }

  if (missingProviders.length > 0) {
    summary += ` Note: Data missing from ${missingProviders.length} source(s).`;
  }

  return {
    totalScore: score,
    rules,
    missingDataPenalty: missingProviders.length > 0,
    corroborationBonusApplied: hasCorroboration,
    humanReadableSummary: summary,
  };
}