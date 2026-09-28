import { z } from 'zod';

import { presentationVersionIdSchema } from '../common/ids.js';

// C-31 — Remove uploaded presentation version: DELETE /api/v1/presentations/:presentationId/uploaded-version
// (docs/requirements/view-data-contracts/C-31-remove-uploaded-version.md). F30; reverts to the builder-only presentation.

export const c31RequestSchema = z.object({}).strict();

export const c31ResponseSchema = z
  .object({
    removed: z.boolean(),
    versionId: presentationVersionIdSchema,
  })
  .strict();

export type C31Request = z.infer<typeof c31RequestSchema>;
export type C31Response = z.infer<typeof c31ResponseSchema>;
