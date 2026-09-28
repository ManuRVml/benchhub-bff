import { z } from 'zod';

import { kviIdSchema, simulationIdSchema, strategicPlanIdSchema } from '../common/ids.js';

// C-25 — Generate strategic plan: POST /api/v1/strategic-plans
// (docs/requirements/view-data-contracts/C-25-generate-strategic-plan.md). F28; the plan is a Yarbis suggestion.

/** One prioritised plan row (CF-108); C-26 sends the same shape back when the analyst saves the plan. */
export const strategicPlanRowSchema = z
  .object({
    kviId: kviIdSchema,
    indicatorLabel: z.string(),
    urgency: z.enum(['high', 'medium', 'low']),
    /** Absolute gap vs peers, in percentage points. */
    gapPts: z.number(),
    /** KVI weight in its dimension, percentage points 0..100 (CF-99). */
    weightPct: z.number().min(0).max(100),
    /** BFF-generated recommendation text. */
    action: z.string().min(1),
    /** Suggested horizon in days (30 quick wins, 90 structural changes). */
    termDays: z.number().int().min(1),
  })
  .strict();

export const c25RequestSchema = z
  .object({
    fromSimulationId: simulationIdSchema.optional(),
  })
  .strict();

export const c25ResponseSchema = z
  .object({
    plan: z
      .object({
        /** CF-108: the plan id C-26 PATCHes. */
        planId: strategicPlanIdSchema,
        /** `suggestion` for a new plan, `committed` after the user accepts it (prose enum). */
        status: z.enum(['suggestion', 'committed']),
        rows: z.array(strategicPlanRowSchema),
      })
      .strict(),
  })
  .strict();

export type C25Request = z.infer<typeof c25RequestSchema>;
export type C25Response = z.infer<typeof c25ResponseSchema>;
