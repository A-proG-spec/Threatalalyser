// src/providers/virustotal/virustotal.client.ts
import axios from 'axios';
import type { ThreatIndicator } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import type { Provider } from '../types';
import { normalizeVirusTotal } from './virustotal.normalizer';

const BASE_URL = 'https://www.virustotal.com/api/v3';

export class VirusTotalProvider implements Provider {
  readonly name = 'VIRUSTOTAL' as const;

  supports(type: ThreatIndicator['type']): boolean {
    return type === 'URL' || type === 'DOMAIN' || type === 'IP';
  }

  async fetch(indicator: ThreatIndicator) {
    if (!env.VIRUSTOTAL_API_KEY) {
      throw new ApiError(
        500,
        'VirusTotal API key missing',
        'MISSING_API_KEY'
      );
    }

    // ── Build the correct endpoint for the indicator type ──
    let endpoint = '';
    if (indicator.type === 'URL') {
      // VirusTotal expects URLs base64-encoded WITHOUT padding (=)
      const urlId = Buffer.from(indicator.normalizedValue)
        .toString('base64')
        .replace(/=/g, '');
      endpoint = `${BASE_URL}/urls/${urlId}`;
    } else if (indicator.type === 'DOMAIN') {
      endpoint = `${BASE_URL}/domains/${indicator.normalizedValue}`;
    } else if (indicator.type === 'IP') {
      endpoint = `${BASE_URL}/ip_addresses/${indicator.normalizedValue}`;
    } else {
      throw new ApiError(
        400,
        `Unsupported indicator type for VirusTotal: ${indicator.type}`,
        'UNSUPPORTED_INDICATOR'
      );
    }

    try {
      const response = await axios.get(endpoint, {
        headers: { 'x-apikey': env.VIRUSTOTAL_API_KEY },
        timeout: 8000, // Fail fast before the global 10s timeout
      });

      // VT returns 404 for "not in database" — that's a valid "no data",
      // not an error. We catch it below and return null.
      if (!response.data?.data) {
        return null;
      }

      return {
        raw: response.data,
        normalized: normalizeVirusTotal(response.data, indicator.type),
      };
    } catch (err: unknown) {
      // 404 = "no data for this indicator" → return null (clean)
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }

      // 401/403 = auth problem → bubble up so the report shows FAILED
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 403)
      ) {
        throw new ApiError(
          401,
          'VirusTotal API key is invalid or lacks permissions',
          'PROVIDER_AUTH_FAILED'
        );
      }

      // 429 = rate limited → specific status so we can show it in the UI
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        throw new ApiError(
          429,
          'VirusTotal rate limit exceeded',
          'PROVIDER_RATE_LIMITED'
        );
      }

      // Anything else → bubble up
      throw err;
    }
  }
}