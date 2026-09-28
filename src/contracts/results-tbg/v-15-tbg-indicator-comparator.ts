import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

// V-15 — TBG indicator comparator: GET /api/v1/views/tbg-indicator-comparator/:analysisId (SCR-08 module 5, gated).
// Bare payload: the module fails as a whole through the endpoint ApiError (CF-121).

/** Company scope of the comparator; the prose knows only `all` (other values unknown, SCR-08 G1). */
export const v15CompanyScopeSchema = z.enum(['all']);

/** Query of the GET: `horizon` (URL `horizonte`, no `union`), module-local `indicatorId` and `companyScope`. */
export const v15RequestSchema = z
  .object({
    horizon: z.enum(['tbg', 'ilp']).default('tbg'),
    indicatorId: indicatorIdSchema.default(indicatorIdSchema.parse('ind_roace')),
    companyScope: v15CompanyScopeSchema.default('all'),
  })
  .strict();

export const v15IndicatorSchema = z
  .object({
    id: indicatorIdSchema,
    label: z.string(),
    unit: UnitCodeSchema,
    lowerIsBetter: z.boolean(),
  })
  .strict();

export const v15TilesSchema = z
  .object({
    ecopetrolValue: z.number(),
    tbgAvg: z.number(),
    gapPts: z.number(),
    rank: z.number().int().min(1),
    of: z.number().int().min(1),
  })
  .strict();

export const v15RankingRowSchema = z
  .object({
    companyId: companyIdSchema,
    name: z.string(),
    value: z.number(),
    isTbgMember: z.boolean(),
    isEcopetrol: z.boolean(),
  })
  .strict();

export const v15ResponseSchema = z
  .object({
    indicator: v15IndicatorSchema,
    indicatorOptions: z.array(z.object({ id: indicatorIdSchema, label: z.string() }).strict()),
    scopeOptions: z.array(z.object({ id: v15CompanyScopeSchema, labelKey: z.string() }).strict()),
    tiles: v15TilesSchema,
    ranking: z.array(v15RankingRowSchema),
    membership: z
      .object({ inside: z.array(companyIdSchema), outside: z.array(companyIdSchema) })
      .strict(),
    gapToLeaderPts: z.number(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V15Request = z.infer<typeof v15RequestSchema>;
export type V15Response = z.infer<typeof v15ResponseSchema>;
