import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { presentationIdSchema } from '../common/ids.js';

import {
  presentationStatusSchema,
  presentationTemplateIdSchema,
  templateAccentKeySchema,
} from './presentations-shared.js';

// V-43 — Presentation detail: GET /api/v1/views/presentation-detail/:presentationId
// (docs/requirements/view-data-contracts/V-43-presentation-detail.md). SCR-14 viewer frame; the slides come from V-42
// (`slideRef`) and the comments from V-26. `meta` is the primary datum: a failure is an ApiError, not a section.

export const v43ResponseSchema = z
  .object({
    meta: z
      .object({
        id: presentationIdSchema,
        name: z.string(),
        // The viewer shows a resolved template (templateName / accentKey are derived from it), so no null here.
        templateId: presentationTemplateIdSchema,
        templateName: z.string(),
        status: presentationStatusSchema,
        createdOn: z.iso.date(),
        publishedOn: z.iso.date().nullable(),
        // "Descargar" then delivers the uploaded PPT.
        hasUploadedVersion: z.boolean(),
      })
      .strict(),
    accentKey: templateAccentKeySchema,
    slideRef: z
      .object({
        view: z.literal('V-42'),
        path: z.string().startsWith('/api/v1/views/presentation-slides/'),
        // Drives the pager dots before V-42 resolves.
        slideCount: z.number().int().min(0),
      })
      .strict(),
    comments: z.object({ count: z.number().int().min(0) }).strict(),
    // canEdit, canDownload, canComment.
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V43Response = z.infer<typeof v43ResponseSchema>;
