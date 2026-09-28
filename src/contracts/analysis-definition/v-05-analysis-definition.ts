import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, draftIdSchema, indicatorIdSchema } from '../common/ids.js';
import { queryIntSchema } from '../common/query.js';

// V-05 — Analysis definition (wizard frame, step 1 fields): GET /api/v1/views/analysis-definition/:draftId
// (docs/requirements/view-data-contracts/V-05-analysis-definition.md). Single primary datum; the step 2/3/5 catalogs are
// V-06, V-07 and V-08.

export const analysisTypeSchema = z.enum(['estrategico_tbg', 'estrategico_ilp', 'desempeno_pares']);
export const analysisScopeSchema = z.enum(['grupo_ecopetrol', 'isa']);
export const quarterSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const quarterPeriodSchema = z
  .object({
    year: z.number().int(),
    quarter: quarterSchema,
  })
  .strict();

export const v05DraftSchema = z
  .object({
    id: draftIdSchema,
    type: analysisTypeSchema,
    name: z.string(),
    objective: z.string(),
    question: z.string(),
    currentPeriod: quarterPeriodSchema,
    comparedPeriod: quarterPeriodSchema,
    cutOffDate: z.iso.date().nullable(),
    scope: z.array(analysisScopeSchema),
    competitorIds: z.array(companyIdSchema),
    indicatorIds: z.array(indicatorIdSchema),
    // Source ids are data-source keys (capital_iq, bloomberg, platts, …); no closed list in the contract.
    sources: z.array(
      z
        .object({
          id: z.string().min(1),
          isPrimary: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export const v05StepStatusSchema = z
  .object({
    step: z.number().int().min(1).max(5),
    status: z.enum(['valid', 'invalid', 'untouched']),
    // Prose: field errors are `{field, messageKey}`.
    errors: z.array(
      z
        .object({
          field: z.string().min(1),
          messageKey: z.string().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export const v05ResponseSchema = z
  .object({
    draft: v05DraftSchema,
    stepStatus: z.array(v05StepStatusSchema),
    options: z
      .object({
        types: z.array(analysisTypeSchema),
        quarters: z.array(quarterSchema),
        years: z.array(z.number().int()),
        scopes: z.array(analysisScopeSchema),
      })
      .strict(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V05Response = z.infer<typeof v05ResponseSchema>;

// Query: `step` (URL `paso`) only decides which stepStatus entry is `current`. The prose says "invalid → 1"; the BFF
// rejects it instead and the SPA normalises `paso` before calling.
export const v05QuerySchema = z
  .object({
    step: queryIntSchema.max(5).default(1),
  })
  .strict();

export type V05Query = z.infer<typeof v05QuerySchema>;
