import axios from 'axios';
import type { RiskLevel } from '@prisma/client';
import type { RuleResult } from './rules';
import type { MitreTechnique } from './attack-mapping';
import { env } from '../config/env';
import { logger } from '../lib/logger';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateAISummary(
  indicator: string,
  score: number,
  level: RiskLevel,
  rules: RuleResult[],
  mitre: MitreTechnique[]
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no API key is provided
  if (!apiKey) {
    return `This indicator has been assigned a ${level} risk score (${score}/100). ${rules.map(r => r.reason).join(' ')}`;
  }

  const ruleText = rules.map(r => `- ${r.provider}: ${r.reason} (${r.points} points)`).join('\n');
  const mitreText = mitre.length > 0 ? `MITRE ATT&CK Techniques: ${mitre.map(m => m.id).join(', ')}` : '';

  const prompt = `
    You are a Senior SOC Analyst. Provide a concise, 2-3 sentence summary and a single actionable recommendation for the following threat intelligence data.
    Do not use markdown formatting. Just return plain text.
    
    Indicator: ${indicator}
    Risk Score: ${score}/100 (${level})
    
    Evidence:
    ${ruleText}
    ${mitreText}
  `;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { timeout: 5000 }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch (err) {
    logger.warn({ err }, 'Failed to generate AI summary');
    return `Automated assessment flags this indicator as ${level} risk based on data from ${rules.length} sources.`;
  }
}