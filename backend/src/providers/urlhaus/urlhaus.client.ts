// src/providers/urlhaus/urlhaus.client.ts
import axios from 'axios';
import type { ThreatIndicator } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import type { Provider } from '../types';
import { normalizeUrlhaus } from './urlhaus.normalizer';

const BASE_URL = 'https://urlhaus-api.abuse.ch/v1';

export class UrlhausProvider implements Provider {
  readonly name = 'URLHAUS' as const;

  supports(type: ThreatIndicator['type']): boolean {
    // URLhaus primarily tracks URLs and hosts, but can look up IPs too
    return type === 'URL' || type === 'DOMAIN' || type === 'IP';
  }

  async fetch(indicator: ThreatIndicator) {
    if (!env.URLHAUS_API_KEY) {
      throw new ApiError(500, 'URLhaus Auth-Key missing', 'MISSING_API_KEY');
    }

    let endpoint = '';
    let payload: Record<string, string> = {};

    if (indicator.type === 'URL') {
      endpoint = `${BASE_URL}/url/`;
      payload = { url: indicator.normalizedValue };
    } else if (indicator.type === 'DOMAIN' || indicator.type === 'IP') {
      endpoint = `${BASE_URL}/host/`;
      payload = { host: indicator.normalizedValue };
    }

    try {
      // URLhaus requires the Auth-Key header now
      const response = await axios.post(endpoint, new URLSearchParams(payload), {
        headers: { 
          'Auth-Key': env.URLHAUS_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 8000,
      });

      // URLhaus returns { query_status: "no_results" } if not found
      if (response.data?.query_status === 'no_results') {
        return null;
      }

      return {
        raw: response.data,
        normalized: normalizeUrlhaus(response.data, indicator.type),
      };
    } catch (err: unknown) {
      throw err;
    }
  }
}