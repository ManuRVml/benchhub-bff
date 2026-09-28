import { z } from 'zod';

import { strategicPlanIdSchema } from '../common/ids.js';

import { strategicPlanRowSchema } from './c-25-generate-strategic-plan.js';

// C-26 — Update strategic plan: PATCH /api/v1/strategic-plans/:planId
// (docs/requirements/view-data-contracts/C-26-update-strategic-plan.md). F28; persists the rows as actionable items.

export const c26RequestSchema = z
  .object({
    plan: z.object({ rows: z.array(strategicPlanRowSchema) }).strict(),
  })
  .strict();

export const c26ResponseSchema = z
  .object({
    saved: z.boolean(),
    planId: strategicPlanIdSchema,
  })
  .strict();

export type C26Request = z.infer<typeof c26RequestSchema>;
export type C26Response = z.infer<typeof c26ResponseSchema>;
