import { z } from 'zod';

import { presentationVersionIdSchema } from '../common/ids.js';

// C-30 — Upload presentation version: PUT /api/v1/presentations/:presentationId/uploaded-version
// (docs/requirements/view-data-contracts/C-30-upload-presentation.md). F30.
// The file travels as multipart/form-data (.ppt / .pptx, ≤ 50 MB, MIME + magic-byte checked); the JSON body is empty.

export const c30RequestSchema = z.object({}).strict();

export const c30ResponseSchema = z
  .object({
    uploaded: z.boolean(),
    versionId: presentationVersionIdSchema,
    fileName: z.string().regex(/\.[pP][pP][tT][xX]?$/),
  })
  .strict();

export type C30Request = z.infer<typeof c30RequestSchema>;
export type C30Response = z.infer<typeof c30ResponseSchema>;
