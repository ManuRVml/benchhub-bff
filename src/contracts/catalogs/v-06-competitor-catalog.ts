import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { companyIdSchema } from '../common/ids.js';

// V-06 — Competitor catalog (wizard step 2): GET /api/v1/views/competitor-catalog
// (docs/requirements/view-data-contracts/V-06-competitor-catalog.md). Cached catalog grouped by strategic category plus
// the Yarbis suggestion; query `businessLine` = all | oil_gas | energeticos filters the groups.

export const businessLineSchema = z.enum(['oil_gas', 'energeticos']);

export const v06CompanySchema = z
  .object({
    id: companyIdSchema,
    name: z.string(),
    // Prose: an unknown profile is returned as country / category null.
    country: z.string().nullable(),
    category: z.string().nullable(),
    colorKey: companyColorKeySchema,
  })
  .strict();

export const v06GroupSchema = z
  .object({
    id: z.string().min(1),
    label: z.string(),
    businessLine: businessLineSchema,
    companies: z.array(v06CompanySchema),
  })
  .strict();

export const v06SuggestionSchema = z
  .object({
    text: z.string(),
    companyId: companyIdSchema,
    aiStatus: z.enum(['suggestion']),
  })
  .strict();

export const v06ResponseSchema = z
  .object({
    groups: z.array(v06GroupSchema),
    // Prose: a missing suggestion (null) hides the Yarbis box without failing the catalog.
    suggestion: v06SuggestionSchema.nullable(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V06Response = z.infer<typeof v06ResponseSchema>;

// Query: `businessLine` (URL `linea`) is a view filter only, never saved in the draft.
export const v06QuerySchema = z
  .object({
    businessLine: z.enum(['all', ...businessLineSchema.options]).default('all'),
  })
  .strict();

export type V06Query = z.infer<typeof v06QuerySchema>;
