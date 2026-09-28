import { z } from 'zod';

import { indicatorIdSchema, leverIdSchema } from '../common/ids.js';

// C-21 — Evaluate sensitivity: POST /api/v1/sensitivity-evaluations
// (docs/requirements/view-data-contracts/C-21-evaluate-sensitivity.md). F27; stateless, debounced by the client.

export const leverValueSchema = z
  .object({
    leverId: leverIdSchema,
    value: z.number(),
  })
  .strict();

export const c21RequestSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    levers: z.array(leverValueSchema),
  })
  .strict();

export const c21ResponseSchema = z
  .object({
    base: z
      .object({
        indicatorId: indicatorIdSchema,
        value: z.number(),
      })
      .strict(),
    simulated: z.object({ value: z.number() }).strict(),
    target: z.number(),
    gap: z.number(),
    linked: z.array(
      z
        .object({
          indicatorId: indicatorIdSchema,
          // Relative variation of the linked indicator (the example uses a ratio, 0.05 = 5 %).
          variation: z.number(),
        })
        .strict(),
    ),
  })
  .strict();

export type C21Request = z.infer<typeof c21RequestSchema>;
export type C21Response = z.infer<typeof c21ResponseSchema>;
