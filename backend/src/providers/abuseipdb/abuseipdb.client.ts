// src/providers/abuseipdb/abuseipdb.client.ts
import axios from 'axios';
import type { ThreatIndicator } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import type { Provider } from '../types';
import { normalizeAbuseIPDB } from './abuseipdb.normalizer';

const BASE_URL = 'https://api.abuseipdb.com/api/v2';

export class AbuseIPDBProvider implements Provider {
  readonly name = 'ABUSEIPDB' as const;

  supports(type: ThreatIndicator['type']): boolean {
    return type === 'IP'; // ONLY IPs
  }

  async fetch(indicator: ThreatIndicator) {
    if (!env.ABUSEIPDB_API_KEY) {
      throw new ApiError(500, 'AbuseIPDB API key missing', 'MISSING_API_KEY');
    }

    try {
      const response = await axios.get(`${BASE_URL}/check`, {
        params: {
          ipAddress: indicator.normalizedValue,
          maxAgeInDays: 90,
        },
        headers: {
          Key: env.ABUSEIPDB_API_KEY,
          Accept: 'application/json',
        },
        timeout: 8000,
      });

      return {
        raw: response.data,
        normalized: normalizeAbuseIPDB(response.data),
      };
    } catch (err: unknown) {
      // If the IP is invalid, AbuseIPDB returns a 422
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        return null;
      }
      throw err;
    }
  }
}