import { z } from 'zod';

import { commentIdSchema } from '../common/ids.js';

// C-10 — Create review comment: POST /api/v1/review-comments
// (web@d4c7ea2 docs/design/view-data-contracts/C-10-create-review-comment.md). Feature F32.

/** Entities a review comment or a change request (C-12) can point at; CF-132: the one enum, shared with V-26. */
export const reviewEntityTypeSchema = z.enum([
  'analysis',
  'indicator',
  'company',
  'section',
  'value_monitor',
  'presentation',
]);

/** Review comment workflow: C-10 creates `pending`, C-11 moves it (CF-101: English snake_case). */
export const reviewCommentStatusSchema = z.enum(['pending', 'in_analysis', 'resolved']);

export const c10RequestSchema = z
  .object({
    entityType: reviewEntityTypeSchema,
    /** Id of the commented entity; its kind depends on `entityType`, so it is not branded. */
    entityId: z.string().min(1),
    text: z.string().min(1),
    /** Reply to this comment (reply thread). */
    parentId: commentIdSchema.optional(),
  })
  .strict();

export const c10ResponseSchema = z
  .object({
    id: commentIdSchema,
    createdAt: z.iso.datetime({ offset: true }),
    status: reviewCommentStatusSchema,
  })
  .strict();

export type C10Request = z.infer<typeof c10RequestSchema>;
export type C10Response = z.infer<typeof c10ResponseSchema>;
