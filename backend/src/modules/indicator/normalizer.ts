// src/modules/indicator/normalizer.ts
import { IndicatorType } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';

/**
 * A normalized indicator is the canonical form used for:
 * - deduplication (one ThreatIndicator per (type, normalizedValue))
 * - cache keys
 * - provider queries (each provider wants a specific form)
 */
export interface NormalizedIndicator {
  /** URL | DOMAIN | IP — assigned by our classifier */
  type: IndicatorType;
  /** What the user typed, verbatim. Preserved for the report UI. */
  original: string;
  /**
   * Canonical form. Lowercase domain, scheme+host+path for URL,
   * dotted-decimal for IPv4 (IPv6 lowercased).
   * This is what gets stored in ThreatIndicator.normalizedValue.
   */
  normalized: string;
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Main entry point. Classifies and normalizes in one shot.
 * Throws ApiError(400) for anything it can't confidently classify.
 *
 * Design notes:
 * - We do NOT do DNS resolution here. That would turn a simple validation
 *   step into an SSRF vector and blow up rate limits. The classifier is
 *   purely syntactic.
 * - We tolerate missing scheme on URLs (`example.com/path` → `https://...`)
 *   because users habitually paste things without `https://`.
 * - Bare hostname with no path and no scheme → classified as DOMAIN
 *   (more cache-friendly; VirusTotal has a dedicated /domains/ endpoint).
 */
export function normalizeIndicator(raw: string): NormalizedIndicator {
  if (typeof raw !== 'string') {
    throw new ApiError(400, 'Indicator must be a string', 'INVALID_INDICATOR');
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ApiError(400, 'Indicator is empty', 'EMPTY_INDICATOR');
  }
  if (trimmed.length > 2048) {
    throw new ApiError(400, 'Indicator is too long', 'INDICATOR_TOO_LONG');
  }

  // 1. Try as IPv4
  const ipv4 = tryParseIPv4(trimmed);
  if (ipv4) return { type: 'IP', original: raw, normalized: ipv4 };

  // 2. Try as bracketed IPv6 (URLs need brackets, raw IPs don't)
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const ipv6 = tryParseIPv6(trimmed.slice(1, -1));
    if (ipv6) return { type: 'IP', original: raw, normalized: ipv6 };
  }

  // 3. Try as raw IPv6 (no brackets)
  const ipv6 = tryParseIPv6(trimmed);
  if (ipv6) return { type: 'IP', original: raw, normalized: ipv6 };

  // 4. Try as URL (has scheme)
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    const url = tryParseURL(trimmed);
    if (url) return { type: 'URL', original: raw, normalized: url };
    throw new ApiError(400, 'Malformed URL', 'INVALID_URL');
  }

  // 5. No scheme — could be domain or scheme-less URL
  const looksLikeURL = /[/?]/.test(trimmed); // has path or query
  if (looksLikeURL) {
    const withScheme = `https://${trimmed}`;
    const url = tryParseURL(withScheme);
    if (url) return { type: 'URL', original: raw, normalized: url };
  } else {
    // Bare hostname — treat as DOMAIN
    const domain = tryParseDomain(trimmed);
    if (domain) return { type: 'DOMAIN', original: raw, normalized: domain };
  }

  throw new ApiError(
    400,
    'Unrecognized indicator. Provide a URL, domain, or IP address.',
    'INVALID_INDICATOR'
  );
}

/**
 * Convenience: classify without throwing.
 * Returns null on invalid input — useful in tests and in the frontend.
 */
export function tryNormalizeIndicator(
  raw: string
): NormalizedIndicator | null {
  try {
    return normalizeIndicator(raw);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Internal parsers
// ─────────────────────────────────────────────────────────────

function tryParseIPv4(value: string): string | null {
  const m = value.match(IPV4_RE);
  if (!m) return null;
  const octets = [m[1], m[2], m[3], m[4]].map(Number);
  if (octets.some((o) => o < 0 || o > 255)) return null;
  return octets.join('.');
}

/**
 * IPv6 parsing is notoriously tricky. We only validate the SHAPE here —
 * real deployments would use a library. Our rule:
 * - Must contain at least 2 colons
 * - Characters limited to hex, colons, dots (for embedded IPv4)
 * - Max length 39 chars
 * The authoritative validator happens at the provider (they'll reject
 * anything they don't like anyway).
 */
function tryParseIPv6(value: string): string | null {
  if (!/^[0-9a-fA-F:.]+$/.test(value)) return null;
  if ((value.match(/:/g) ?? []).length < 2) return null;
  if (value.length > 39) return null;
  // Normalize: lowercase, collapse leading zeros is optional here
  return value.toLowerCase();
}

function tryParseURL(value: string): string | null {
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    // Reject URLs with credentials (phishing vectors, also SSRF risk if
    // we ever fetched them ourselves).
    if (u.username || u.password) return null;
    // Reject empty host
    if (!u.hostname) return null;

    // Canonical form: lowercase host, keep path/query as-is.
    // We deliberately drop hash fragments — they never matter for threat
    // intelligence and just fragment the cache.
    u.hash = '';
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return null;
  }
}

function tryParseDomain(value: string): string | null {
  // Lowercase, strip trailing dot (example.com. is valid DNS but same domain)
  const cleaned = value.toLowerCase().replace(/\.$/, '');
  // Reject obvious non-domains
  if (cleaned.length < 4 || cleaned.length > 253) return null;
  if (!cleaned.includes('.')) return null;
  if (!/^[a-z0-9.-]+$/.test(cleaned)) return null;
  // Must end with a real TLD-like segment (>= 2 chars, letters only)
  const tld = cleaned.split('.').pop()!;
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) return null;
  // Reject consecutive dots, leading dot, leading dash in labels
  if (cleaned.includes('..')) return null;
  if (cleaned.startsWith('.') || cleaned.startsWith('-')) return null;
  return cleaned;
}