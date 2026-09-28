import { z } from 'zod';

import { assistantMessageIdSchema, feedbackIdSchema } from '../common/ids.js';

// C-34 — Submit assistant feedback: POST /api/v1/assistant/feedback
// (docs/requirements/view-data-contracts/C-34-submit-assistant-feedback.md). F04; thumbs up / down on an answer.

export const c34RequestSchema = z
  .object({
    messageId: assistantMessageIdSchema,
    rating: z.enum(['up', 'down']),
  })
  .strict();

export const c34ResponseSchema = z
  .object({
    feedbackId: feedbackIdSchema,
    ratedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C34Request = z.infer<typeof c34RequestSchema>;
export type C34Response = z.infer<typeof c34ResponseSchema>;
