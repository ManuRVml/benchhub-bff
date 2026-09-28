import { z } from 'zod';

import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';

// C-06 — Batch update value overrides: PATCH /api/v1/analyses/:analysisId/value-overrides
// (web@d4c7ea2 docs/design/view-data-contracts/C-06-batch-value-overrides.md). Autosave with a 500 ms debounce.

export const valueOverrideSchema = z
  .object({
    companyId: companyIdSchema,
    indicatorId: indicatorIdSchema,
    /** Raw value in the indicator's unit; `null` clears the manual value (the original is kept for reference). */
    value: z.number().nullable(),
    isEstimate: z.boolean(),
    justification: z.string().optional(),
  })
  .strict();

export const c06RequestSchema = z
  .object({ overrides: z.array(valueOverrideSchema).min(1) })
  .strict();

export const c06ResponseSchema = z
  .object({
    saved: z.boolean(),
    overrideCount: z.number().int().min(0),
  })
  .strict();

export type C06Request = z.infer<typeof c06RequestSchema>;
export type C06Response = z.infer<typeof c06ResponseSchema>;
