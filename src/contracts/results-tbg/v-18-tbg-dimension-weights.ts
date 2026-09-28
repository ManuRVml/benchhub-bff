import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema } from '../common/ids.js';
import { dimensionSchema } from '../results/results-shared.js';

// V-18 — TBG dimension weights: GET /api/v1/views/tbg-dimension-weights/:analysisId (SCR-08 module 8, gated).
// Bare payload; a failure is the endpoint ApiError (CF-121).

/** Query of the GET: horizon (URL `horizonte`, no `union`) and the module-local dimension tab. */
export const v18RequestSchema = z
  .object({
    horizon: z.enum(['tbg', 'ilp']).default('tbg'),
    dimension: dimensionSchema.default('fin'),
  })
  .strict();

/** i18n key of the Ecopetrol-vs-peers message: `above | below | equal`. */
export const v18MessageKeySchema = z.enum([
  'tbgWeights.message.above',
  'tbgWeights.message.below',
  'tbgWeights.message.equal',
]);

export const v18ResponseSchema = z
  .object({
    dimension: dimensionSchema,
    ecopetrolPct: z.number().min(0).max(100),
    peerAvgPct: z.number().int().min(0).max(100),
    diffPts: z.number(),
    message: z
      .object({
        key: v18MessageKeySchema,
        params: z.object({ diffPts: z.number(), dimension: dimensionSchema }).strict(),
      })
      .strict(),
    detail: z.array(
      z
        .object({
          rank: z.number().int().min(1),
          companyId: companyIdSchema,
          name: z.string(),
          pct: z.number().min(0).max(100),
        })
        .strict(),
    ),
    recommendationsCount: z.number().int().min(0),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V18Request = z.infer<typeof v18RequestSchema>;
export type V18Response = z.infer<typeof v18ResponseSchema>;
