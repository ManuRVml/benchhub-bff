import { z } from 'zod';

import { publicationIdSchema } from '../common/ids.js';

// C-29 — Publish presentation: POST /api/v1/presentations/:presentationId/publication
// (docs/requirements/view-data-contracts/C-29-publish-presentation.md). F30; notifies invited viewers.

export const c29RequestSchema = z.object({}).strict();

export const c29ResponseSchema = z
  .object({
    published: z.boolean(),
    publicationId: publicationIdSchema,
    publishedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C29Request = z.infer<typeof c29RequestSchema>;
export type C29Response = z.infer<typeof c29ResponseSchema>;
