import { z } from 'zod';

import { changeRequestIdSchema } from '../common/ids.js';

import { reviewEntityTypeSchema } from './c-10-create-review-comment.js';

// C-12 — Create change request: POST /api/v1/change-requests
// (web@d4c7ea2 docs/design/view-data-contracts/C-12-create-change-request.md). Feature F33.

export const changeRequestKindSchema = z.enum(['data', 'scope', 'recalculation']);

export const c12RequestSchema = z
  .object({
    entityType: reviewEntityTypeSchema,
    /** Id of the entity the change is requested on; its kind depends on `entityType`, so it is not branded. */
    entityId: z.string().min(1),
    text: z.string().min(1),
    kind: changeRequestKindSchema,
  })
  .strict();

export const c12ResponseSchema = z
  .object({
    id: changeRequestIdSchema,
    createdAt: z.iso.datetime({ offset: true }),
    /** A new change request always starts in review; later states are not in the v1 contracts. */
    status: z.enum(['pending_review']),
  })
  .strict();

export type C12Request = z.infer<typeof c12RequestSchema>;
export type C12Response = z.infer<typeof c12ResponseSchema>;
