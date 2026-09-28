import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { analysisIdSchema, presentationIdSchema } from '../common/ids.js';
import { pageSchema } from '../common/page.js';
import { queryIntSchema } from '../common/query.js';

import { presentationStatusSchema } from './presentations-shared.js';

// V-40 — Presentations: GET /api/v1/views/presentations
// (docs/requirements/view-data-contracts/V-40-presentations.md). SCR-13 list "Presentaciones creadas". The prose calls
// the list one SectionResult, but the example is the bare page (the example wins for shape).

export const v40PresentationRowSchema = z
  .object({
    id: presentationIdSchema,
    name: z.string(),
    createdOn: z.iso.date(),
    status: presentationStatusSchema,
    // null → "—" (not published yet).
    publishedOn: z.iso.date().nullable(),
    // Per row: canEdit ("Editar"), canView ("Ver detalle").
    permissions: ActionPermissionsSchema,
  })
  .strict();

export const v40ResponseSchema = pageSchema(v40PresentationRowSchema)
  .extend({
    // canCreate ("+ Crear presentación", analyst only).
    permissions: ActionPermissionsSchema,
  })
  .strict();

// Query: `analysisId` is set on /analisis/:analysisId/presentaciones and absent on the sidebar route (CF-46, OQ-14).
export const v40QuerySchema = z
  .object({
    analysisId: analysisIdSchema.optional(),
    page: queryIntSchema.default(1),
    pageSize: queryIntSchema.default(20),
  })
  .strict();

export type V40Response = z.infer<typeof v40ResponseSchema>;
export type V40Query = z.infer<typeof v40QuerySchema>;
