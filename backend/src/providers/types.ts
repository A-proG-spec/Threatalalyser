import type { ThreatProvider, ThreatIndicator } from '@prisma/client';
import type { NormalizedProviderResult } from '../types/normalized';

/**
 * The interface every provider must implement.
 */
export interface Provider {
  /** The enum value from schema.prisma */
  readonly name: ThreatProvider;

  /** Does this provider support this indicator type? */
  supports(indicatorType: ThreatIndicator['type']): boolean;

  /**
   * Fetch data from the provider.
   * Throws an error if the request fails completely.
   * Returns `null` if the provider has no data for this indicator.
   */
  fetch(indicator: ThreatIndicator): Promise<{
    raw: unknown;
    normalized: NormalizedProviderResult;
  } | null>;
}