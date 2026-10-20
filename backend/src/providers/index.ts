import type { ThreatIndicator } from '@prisma/client';
import type { ProviderFetchOutcome, NormalizedProviderResult } from '../types/normalized';
import { logger } from '../lib/logger';
import { VirusTotalProvider } from './virustotal/virustotal.client';
import { UrlhausProvider } from './urlhaus/urlhaus.client';
import { AbuseIPDBProvider } from './abuseipdb/abuseipdb.client';
import { getCachedProviderResponse, setCachedProviderResponse } from '../cache/threatCache.service';
import { isTimeoutError } from '../utils/timeouts';

/**
 * The registry. Add new providers here.
 */
const PROVIDERS = [
  new VirusTotalProvider(),
  new UrlhausProvider(),
  new AbuseIPDBProvider(),
];

/**
 * Run all applicable providers for the given indicator concurrently.
 */
export function runAllProviders(
  indicator: ThreatIndicator,
  userId: string | null
): Promise<ProviderFetchOutcome>[] {
  // Filter to only providers that support this indicator type (e.g. AbuseIPDB only handles IPs)
  const applicable = PROVIDERS.filter((p) => p.supports(indicator.type));

  return applicable.map(async (provider): Promise<ProviderFetchOutcome> => {
    const startedAt = new Date();
    
    // 1. Check cache first
    const cached = await getCachedProviderResponse(indicator.id, provider.name);
    if (cached && cached.isFresh) {
      return {
        provider: provider.name,
        status: 'SUCCESS',
        normalized: cached.response as unknown as NormalizedProviderResult,
        raw: null,
        fromCache: true,
        fetchStartedAt: startedAt,
        fetchFinishedAt: new Date(),
      };
    }

    // 2. Fetch from live API
    try {
      const result = await provider.fetch(indicator);
      
      if (!result) {
        // Provider returned no data (clean/not found) — this is still a SUCCESS status
        return {
          provider: provider.name,
          status: 'SUCCESS',
          normalized: null,
          raw: null,
          fromCache: false,
          fetchStartedAt: startedAt,
          fetchFinishedAt: new Date(),
        };
      }

      // 3. Save to cache on success
      await setCachedProviderResponse(
        indicator.id,
        provider.name,
        result.normalized as any
      );

      return {
        provider: provider.name,
        status: 'SUCCESS',
        normalized: result.normalized,
        raw: result.raw,
        fromCache: false,
        fetchStartedAt: startedAt,
        fetchFinishedAt: new Date(),
      };

    } catch (err: any) {
      // 4. Handle failures gracefully
      const isTimeout = isTimeoutError(err);
      logger.warn(
        { provider: provider.name, indicatorId: indicator.id, err: err.message },
        `Provider ${provider.name} failed`
      );

      return {
        provider: provider.name,
        status: isTimeout ? 'TIMEOUT' : 'FAILED',
        normalized: null,
        raw: null,
        errorCode: err.code || err.name || 'UNKNOWN',
        errorMessage: err.message || String(err),
        fromCache: false,
        fetchStartedAt: startedAt,
        fetchFinishedAt: new Date(),
      };
    }
  });
}