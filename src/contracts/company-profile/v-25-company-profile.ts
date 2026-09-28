import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { companyIdSchema, newsIdSchema } from '../common/ids.js';

// V-25 — Company profile (OVL-13): GET /api/v1/views/company-profile/:companyId
// (docs/requirements/view-data-contracts/V-25-company-profile.md). Company + attributes are the primary datum; an unknown
// profile sends null attributes and no segments. News fails alone as `news: null` (prose), not as a SectionResult.

export const v25CompanySchema = z
  .object({
    id: companyIdSchema,
    name: z.string(),
    colorKey: companyColorKeySchema,
  })
  .strict();

export const v25NewsItemSchema = z
  .object({
    id: newsIdSchema,
    headline: z.string(),
    /** Left border colour of the news card: `up` success, `down` danger. */
    impact: z.enum(['up', 'down']),
  })
  .strict();

export const v25ResponseSchema = z
  .object({
    company: v25CompanySchema,
    country: z.string().nullable(),
    category: z.string().nullable(),
    business: z.string().nullable(),
    segments: z.array(z.string()),
    /** This company's news, newest first, at most 3; `null` when the news provider failed. */
    news: z.array(v25NewsItemSchema).max(3).nullable(),
    /** No action flags: always the empty ActionPermissions. */
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V25Response = z.infer<typeof v25ResponseSchema>;
