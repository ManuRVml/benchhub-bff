import { z } from 'zod';

import {
  reviewCommentStatusSchema,
  reviewEntityTypeSchema,
} from '../commands/c-10-create-review-comment.js';
import { changeRequestDecisionSchema } from '../commands/c-13-update-change-request.js';
import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { changeRequestIdSchema, commentIdSchema } from '../common/ids.js';
import { pageSchema } from '../common/page.js';

// V-26 — Comment thread: GET /api/v1/views/comment-thread?entityType=&entityId=&page=1
// (docs/requirements/view-data-contracts/V-26-comment-thread.md). F32 comments and F33 change requests of one entity,
// newest activity first, 20 threads per page. A single primary datum: a failure stays inside the comments card.

export const v26QuerySchema = z
  .object({
    /** CF-132: the same enum as C-10 / C-12. */
    entityType: reviewEntityTypeSchema,
    /** Id of the entity; for `indicator` the pair `ana_…:ind_…`, so it is not a single branded id. */
    entityId: z.string().min(1),
    page: z.coerce.number().int().min(1).default(1),
  })
  .strict();

/** Author display data only: no emails or user ids of other users (minimum disclosure). */
export const v26AuthorSchema = z
  .object({
    name: z.string(),
    /** i18n key of the author's role, e.g. `role.executiveIntegral`. */
    roleLabelKey: z.string().min(1),
  })
  .strict();

export const v26ReplySchema = z
  .object({
    id: commentIdSchema,
    author: v26AuthorSchema,
    text: z.string(),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

const threadBase = {
  author: v26AuthorSchema,
  text: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  replies: z.array(v26ReplySchema),
};

/** A comment has a status and never a decision; a change request has a decision (null while open) and no status. */
export const v26ThreadSchema = z.discriminatedUnion('kind', [
  z
    .object({
      id: commentIdSchema,
      kind: z.literal('comment'),
      ...threadBase,
      status: reviewCommentStatusSchema,
      decision: z.null(),
    })
    .strict(),
  z
    .object({
      id: changeRequestIdSchema,
      kind: z.literal('change_request'),
      ...threadBase,
      status: z.null(),
      decision: changeRequestDecisionSchema.nullable(),
    })
    .strict(),
]);

/** CF-133: the common Page<T> envelope; `totalItems` counts the entity's threads over all pages (20 per page). */
export const v26ResponseSchema = pageSchema(v26ThreadSchema)
  .extend({ permissions: ActionPermissionsSchema })
  .strict();

export type V26Query = z.infer<typeof v26QuerySchema>;
export type V26Response = z.infer<typeof v26ResponseSchema>;
