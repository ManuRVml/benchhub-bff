import { z } from 'zod';

import { commentIdSchema } from '../common/ids.js';

import { reviewCommentStatusSchema } from './c-10-create-review-comment.js';

// C-11 — Update review comment status: PATCH /api/v1/review-comments/:commentId
// (web@d4c7ea2 docs/design/view-data-contracts/C-11-update-review-comment.md). Feature F32.

export const c11RequestSchema = z.object({ status: reviewCommentStatusSchema }).strict();

export const c11ResponseSchema = z
  .object({
    id: commentIdSchema,
    status: reviewCommentStatusSchema,
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C11Request = z.infer<typeof c11RequestSchema>;
export type C11Response = z.infer<typeof c11ResponseSchema>;
