import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { analysisIdSchema, userIdSchema } from '../common/ids.js';
import { pageSchema } from '../common/page.js';
import { queryIntSchema } from '../common/query.js';

// V-04 — Analyses list: GET /api/v1/views/analyses
// (docs/requirements/view-data-contracts/V-04-analyses.md). Paged list with server-side filters; filterOptions are
// computed over what the user may see. Single primary datum, no sections.

export const analysisStatusSchema = z.enum(['draft', 'in_progress', 'in_review', 'published']);

export const v04UserRefSchema = z
  .object({
    id: userIdSchema,
    fullName: z.string(),
  })
  .strict();

export const v04AnalysisRowSchema = z
  .object({
    id: analysisIdSchema,
    name: z.string(),
    description: z.string(),
    createdOn: z.iso.date(),
    createdBy: v04UserRefSchema,
    status: analysisStatusSchema,
    canOpenResults: z.boolean(),
  })
  .strict();

// CF-107: the common Page<T> envelope (`totalItems`).
export const v04ResponseSchema = pageSchema(v04AnalysisRowSchema)
  .extend({
    filterOptions: z
      .object({
        createdOn: z.array(z.iso.date()),
        createdBy: z.array(v04UserRefSchema),
        status: z.array(analysisStatusSchema),
      })
      .strict(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V04Response = z.infer<typeof v04ResponseSchema>;

// Query (all optional; absent = "todos"). `ref=tbg-ilp` only marks the active nav item (OQ-03). `pageSize` defaults to
// 20, maximum 100 (CF-120).
export const v04QuerySchema = z
  .object({
    q: z.string().default(''),
    createdOn: z.iso.date().optional(),
    createdBy: userIdSchema.optional(),
    status: analysisStatusSchema.optional(),
    ref: z.enum(['tbg-ilp']).optional(),
    page: queryIntSchema.default(1),
    pageSize: queryIntSchema.max(100).default(20),
  })
  .strict();

export type V04Query = z.infer<typeof v04QuerySchema>;
