import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { analysisIdSchema, companyIdSchema, presentationIdSchema } from '../common/ids.js';

import { horizonSchema } from './results-shared.js';

// V-09 — Results header: GET /api/v1/views/results-header/:analysisId (docs/requirements/view-data-contracts/V-09).
// Primary datum of SCR-08: a single payload, no SectionResult; each module loads from its own view.

export const v09ModuleIdSchema = z.enum([
  'actionRow',
  'companyCoverage',
  'peerAverageComparison',
  'companyComparison',
  'tbgIndicatorComparator',
  'futureAspiration',
  'tbgHorizon',
  'tbgDimensionWeights',
  'comparisonProfiles',
  'reportSummary',
  'footerActions',
]);

export const v09ResponseSchema = z
  .object({
    analysis: z
      .object({
        id: analysisIdSchema,
        title: z.string(),
        status: z.enum(['draft', 'in_progress', 'in_review', 'published']),
        // Report lifecycle (critic M-04; CF-101 English snake_case).
        lifecycleState: z.enum(['preparation', 'preview', 'published']),
        periodLabel: z
          .object({ year: z.number().int(), quarter: z.number().int().min(1).max(4) })
          .strict(),
      })
      .strict(),
    horizon: horizonSchema,
    horizonOptions: z.array(z.object({ id: horizonSchema, labelKey: z.string() }).strict()),
    modules: z.array(
      z
        .object({
          id: v09ModuleIdSchema,
          order: z.number().int().min(1),
          isGated: z.boolean(),
          visibleInHorizons: z.array(horizonSchema),
        })
        .strict(),
    ),
    companySet: z.array(
      z.object({ id: companyIdSchema, name: z.string(), colorKey: companyColorKeySchema }).strict(),
    ),
    analysisTabs: z.array(
      z
        .object({
          id: z.enum(['configuration', 'results', 'presentation']),
          isEnabled: z.boolean(),
          // Only the presentation tab carries it; null when the analysis has no presentation yet.
          presentationId: presentationIdSchema.nullable().optional(),
        })
        .strict(),
    ),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V09Response = z.infer<typeof v09ResponseSchema>;

// Query: `horizon` (URL `horizonte=tbg|ilp|tbg-ilp`; the front maps `tbg-ilp` ↔ `union`).
export const v09QuerySchema = z.object({ horizon: horizonSchema.default('tbg') }).strict();

export type V09Query = z.infer<typeof v09QuerySchema>;
