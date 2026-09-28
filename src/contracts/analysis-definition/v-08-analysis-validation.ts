import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';

import { analysisScopeSchema, quarterPeriodSchema } from './v-05-analysis-definition.js';

// V-08 — Analysis validation (wizard step 5 summary): GET /api/v1/views/analysis-validation/:draftId
// (docs/requirements/view-data-contracts/V-08-analysis-validation.md). Single primary datum; the scope is sent as
// structure and the web builds "Grupo Ecopetrol · Trimestral T4 2025" with i18n.

export const v08ResponseSchema = z
  .object({
    scope: z
      .object({
        entities: z.array(analysisScopeSchema),
        // The example only shows `quarterly`; `annual` covers the annual temporal view (listed as a divergence).
        cadence: z.enum(['quarterly', 'annual']),
        currentPeriod: quarterPeriodSchema,
      })
      .strict(),
    competitors: z.array(
      z
        .object({
          id: companyIdSchema,
          name: z.string(),
        })
        .strict(),
    ),
    indicatorGroups: z.array(
      z
        .object({
          id: z.string().min(1),
          label: z.string(),
          count: z.number().int().min(0),
          items: z.array(
            z
              .object({
                id: indicatorIdSchema,
                label: z.string(),
              })
              .strict(),
          ),
        })
        .strict(),
    ),
    // Prose: null when no company is under the homologation threshold (the normal case).
    exclusionAlert: z
      .object({
        thresholdPct: z.number().min(0).max(100),
        companies: z.array(
          z
            .object({
              id: companyIdSchema,
              name: z.string(),
              coveragePct: z.number().min(0).max(100),
            })
            .strict(),
        ),
      })
      .strict()
      .nullable(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V08Response = z.infer<typeof v08ResponseSchema>;
