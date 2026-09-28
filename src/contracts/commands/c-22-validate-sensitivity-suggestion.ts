import { z } from 'zod';

import { suggestionIdSchema, userIdSchema } from '../common/ids.js';

// C-22 — Validate sensitivity suggestion: POST /api/v1/sensitivity-suggestions/:suggestionId/validation
// (docs/requirements/view-data-contracts/C-22-validate-sensitivity-suggestion.md). F27; records who validated and when.

export const c22RequestSchema = z.object({}).strict();

export const c22ResponseSchema = z
  .object({
    suggestionId: suggestionIdSchema,
    validatedBy: userIdSchema,
    validatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C22Request = z.infer<typeof c22RequestSchema>;
export type C22Response = z.infer<typeof c22ResponseSchema>;
