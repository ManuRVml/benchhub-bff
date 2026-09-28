import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

import { categoryRefSchema, horizonSchema } from './results-shared.js';

// V-12 — Company comparison (PVC): GET /api/v1/views/company-comparison/:analysisId (SCR-08 module 4).
// A row with companyValue null has diff and outcome null and is excluded from wins / total.

export const v12RowSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    code: z.string().min(1),
    label: z.string(),
    unit: UnitCodeSchema,
    geValue: z.number(),
    companyValue: z.number().nullable(),
    diff: z.number().nullable(),
    // `points` when the indicator unit is `percent`, else the indicator unit.
    diffUnit: UnitCodeSchema,
    lowerIsBetter: z.boolean(),
    outcome: z.enum(['above', 'below']).nullable(),
    hasDetail: z.boolean(),
  })
  .strict();

const countSchema = z.number().int().min(0);

export const v12ResponseSchema = z
  .object({
    company: z
      .object({ id: companyIdSchema, name: z.string(), colorKey: companyColorKeySchema })
      .strict(),
    summary: z
      .object({ wins: countSchema, total: countSchema, winPct: z.number().min(0).max(100) })
      .strict(),
    groups: z.array(
      z
        .object({
          category: categoryRefSchema,
          wins: countSchema,
          total: countSchema,
          rows: z.array(v12RowSchema),
        })
        .strict(),
    ),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V12Response = z.infer<typeof v12ResponseSchema>;

// Query: `horizon` (URL `horizonte`) and `companyId` (URL `pvc`; absent = the first company of the set, resolved by the
// BFF).
export const v12QuerySchema = z
  .object({
    horizon: horizonSchema.default('tbg'),
    companyId: companyIdSchema.optional(),
  })
  .strict();

export type V12Query = z.infer<typeof v12QuerySchema>;
