import { z } from 'zod';

import { operationIdSchema } from '../common/ids.js';

// C-03 — Generate analysis: POST /api/v1/analysis-drafts/:draftId/generation
// (web@d4c7ea2 docs/design/view-data-contracts/C-03-generate-analysis.md). Long-running: 202 + operationId.

/** Empty body: the draft is the `:draftId` path param. */
export const c03RequestSchema = z.object({}).strict();

export const c03ResponseSchema = z
  .object({
    operationId: operationIdSchema,
    status: z.enum(['accepted']),
  })
  .strict();

export type C03Request = z.infer<typeof c03RequestSchema>;
export type C03Response = z.infer<typeof c03ResponseSchema>;
