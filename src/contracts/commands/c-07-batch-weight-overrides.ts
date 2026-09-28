import { z } from 'zod';

import { indicatorIdSchema } from '../common/ids.js';

// C-07 — Batch update weight overrides: PATCH /api/v1/analyses/:analysisId/weight-overrides
// (web@d4c7ea2 docs/design/view-data-contracts/C-07-batch-weight-overrides.md). Warnings when the sum is not 100.

export const weightOverrideSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    /** Percentage points 0..100 (CF-99); INVALID_WEIGHT outside that range. */
    weight: z.number().min(0).max(100),
  })
  .strict();

export const c07RequestSchema = z
  .object({ weights: z.array(weightOverrideSchema).min(1) })
  .strict();

export const c07ResponseSchema = z
  .object({
    saved: z.boolean(),
    /** Non-blocking notices, e.g. the sum of weights differs from 100 (BACKEND rule 2). */
    warnings: z.array(z.string()),
  })
  .strict();

export type C07Request = z.infer<typeof c07RequestSchema>;
export type C07Response = z.infer<typeof c07ResponseSchema>;
