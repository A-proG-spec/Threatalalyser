// src/config/env.ts
import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  VIRUSTOTAL_API_KEY: z.string().default(''),
  URLHAUS_API_KEY: z.string().default(''),
  ABUSEIPDB_API_KEY: z.string().default(''),

  CACHE_TTL_VIRUSTOTAL: z.coerce.number().int().positive().default(86400),
  CACHE_TTL_URLHAUS: z.coerce.number().int().positive().default(3600),
  CACHE_TTL_ABUSEIPDB: z.coerce.number().int().positive().default(86400),
});

/**
 * Fail-fast helper. Typed as `never` so TypeScript knows
 * execution stops here and never returns a value.
 */
function fail(message: string, details?: unknown): never {
  console.error(`❌ ${message}`);
  if (details !== undefined) {
    console.error(details);
  }
  process.exit(1);
}

// safeParse returns a discriminated union: { success: true; data } | { success: false; error }
const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  fail(
    'Invalid environment configuration:',
    result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  );
}

// At this point TS narrows `result` to the success branch.
// `result.data` has the fully-inferred EnvSchema type — NOT undefined.
export const env = result.data;
export type Env = typeof env;