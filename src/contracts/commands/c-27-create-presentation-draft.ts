import { z } from 'zod';

import { analysisIdSchema, presentationIdSchema } from '../common/ids.js';

// C-27 — Create presentation draft: POST /api/v1/presentations
// (docs/requirements/view-data-contracts/C-27-create-presentation-draft.md). F29.

export const c27RequestSchema = z
  .object({
    analysisId: analysisIdSchema,
  })
  .strict();

export const c27ResponseSchema = z
  .object({
    id: presentationIdSchema,
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C27Request = z.infer<typeof c27RequestSchema>;
export type C27Response = z.infer<typeof c27ResponseSchema>;
