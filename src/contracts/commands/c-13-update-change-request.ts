import { z } from 'zod';

import { changeRequestIdSchema } from '../common/ids.js';

// C-13 — Update change request decision: PATCH /api/v1/change-requests/:requestId
// (docs/requirements/view-data-contracts/C-13-update-change-request.md). Analyst decision on an F33 change request;
// `accepted` may trigger a C-08 recalculation.

export const changeRequestDecisionSchema = z.enum(['accepted', 'rejected']);

export const c13RequestSchema = z
  .object({
    decision: changeRequestDecisionSchema,
    note: z.string().optional(),
  })
  .strict();

export const c13ResponseSchema = z
  .object({
    id: changeRequestIdSchema,
    decision: changeRequestDecisionSchema,
    // Prose: the note is optional on the request, so the stored decision may have none.
    note: z.string().optional(),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C13Request = z.infer<typeof c13RequestSchema>;
export type C13Response = z.infer<typeof c13ResponseSchema>;
