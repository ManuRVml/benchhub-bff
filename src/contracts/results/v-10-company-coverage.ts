import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';
import { sectionResult } from '../common/section-result.js';
import { UnitCodeSchema } from '../common/units.js';

import { dimensionSchema, singleHorizonSchema } from './results-shared.js';

// V-10 — Company coverage: GET /api/v1/views/company-coverage/:analysisId (SCR-08 module 2).
// Four independent sections; missing values are null, never 0 (CF-37).

export const v10KpisSchema = z
  .object({
    companies: z.number().int().min(0),
    complete: z.number().int().min(0),
    incomplete: z.number().int().min(0),
    pendingIndicators: z.number().int().min(0),
  })
  .strict();

export const v10InsightSchema = z.object({ id: z.string().min(1), text: z.string() }).strict();

export const v10CompanyCardSchema = z
  .object({
    id: companyIdSchema,
    name: z.string(),
    initials: z.string(),
    colorKey: companyColorKeySchema,
    coveragePct: z.number().int().min(0).max(100),
    coverageStatus: z.enum(['complete', 'needs_review', 'incomplete']),
    missingCount: z.number().int().min(0),
  })
  .strict();

export const v10CompaniesSchema = z
  .object({
    items: z.array(v10CompanyCardSchema),
    addableCompanies: z.array(z.object({ id: companyIdSchema, name: z.string() }).strict()),
  })
  .strict();

export const v10ValueItemSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    label: z.string(),
    value: z.number().nullable(),
    unit: UnitCodeSchema,
    isEstimate: z.boolean(),
    justification: z.string().nullable(),
  })
  .strict();

export const v10MissingItemSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    label: z.string(),
    value: z.null(),
    unit: UnitCodeSchema,
  })
  .strict();

export const v10SelectedSchema = z
  .object({
    companyId: companyIdSchema,
    groups: z.array(
      z
        .object({
          dimension: dimensionSchema,
          totalPct: z.number().min(0),
          items: z.array(v10ValueItemSchema),
        })
        .strict(),
    ),
    missing: z.array(v10MissingItemSchema),
  })
  .strict();

export const v10ResponseSchema = z
  .object({
    kpis: sectionResult(v10KpisSchema),
    insights: sectionResult(z.array(v10InsightSchema)),
    companies: sectionResult(v10CompaniesSchema),
    selected: sectionResult(v10SelectedSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V10Response = z.infer<typeof v10ResponseSchema>;

export const V10_SECTIONS = ['kpis', 'insights', 'companies', 'selected'] as const;

// Query: `horizon` (URL `horizonte`; the module is hidden in `union`) and `companyId` (URL `compania`; absent = the
// first company of the set, resolved by the BFF).
export const v10QuerySchema = z
  .object({
    horizon: singleHorizonSchema.default('tbg'),
    companyId: companyIdSchema.optional(),
  })
  .strict();

export type V10Query = z.infer<typeof v10QuerySchema>;
