import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { categoryIdSchema, companyIdSchema, indicatorIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

import { categoryRefSchema, horizonSchema } from './results-shared.js';

// V-11 — Peer average comparison: GET /api/v1/views/peer-average-comparison/:analysisId (SCR-08 module 3).
// The prose calls the whole module one SectionResult, but the example is the bare payload (the example wins for shape):
// the module fails as a whole through this view's own error response.

export const v11RowSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    label: z.string(),
    unit: UnitCodeSchema,
    geValue: z.number(),
    peerAvg: z.number(),
    hasDetail: z.boolean(),
  })
  .strict();

export const v11ResponseSchema = z
  .object({
    categories: z.array(categoryRefSchema),
    category: categoryIdSchema,
    rows: z.array(v11RowSchema),
    peerAvgCompanies: z.array(companyIdSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V11Response = z.infer<typeof v11ResponseSchema>;

// Query: `horizon` (URL `horizonte`) and `category` (URL `categoria`, default `rentabilidad`).
export const v11QuerySchema = z
  .object({
    horizon: horizonSchema.default('tbg'),
    category: categoryIdSchema.prefault('rentabilidad'),
  })
  .strict();

export type V11Query = z.infer<typeof v11QuerySchema>;
