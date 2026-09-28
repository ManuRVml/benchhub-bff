import { z } from 'zod';

import { generatedBySchema } from '../common/generated-by.js';
import { presentationIdSchema } from '../common/ids.js';

// C-32 — Generate slide comment draft: POST /api/v1/slide-comment-drafts
// (docs/requirements/view-data-contracts/C-32-generate-slide-comment.md). F29; LLM-backed suggestion, batched client-side
// (up to 8).

export const c32RequestSchema = z
  .object({
    presentationId: presentationIdSchema,
    slideKey: z.string().min(1),
    language: z.enum(['es', 'en']),
  })
  .strict();

export const c32ResponseSchema = z
  .object({
    text: z.string(),
    status: z.literal('suggestion'),
    /** Provenance of the generator (CF-110); never an infrastructure id. */
    generatedBy: generatedBySchema,
  })
  .strict();

export type C32Request = z.infer<typeof c32RequestSchema>;
export type C32Response = z.infer<typeof c32ResponseSchema>;
