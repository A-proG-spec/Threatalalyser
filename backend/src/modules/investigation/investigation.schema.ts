// src/modules/investigation/investigation.schema.ts
import { z } from 'zod';

/**
 * Request body for POST /api/investigations.
 * The `indicator` field is a free-form string — the normalizer decides
 * whether it's a URL, domain, or IP. We validate only that it's a
 * non-empty string here; classification happens in indicator/normalizer.ts.
 */
export const CreateInvestigationSchema = z.object({
  indicator: z
    .string()
    .trim()
    .min(1, 'Indicator is required')
    .max(2048, 'Indicator is too long'),
});

export type CreateInvestigationInput = z.infer<typeof CreateInvestigationSchema>;