import { z } from 'zod';

import { invitationIdSchema, userIdSchema } from '../common/ids.js';

// C-41 — Preview invitations: POST /api/v1/analyses/:analysisId/preview-invitations
// (docs/requirements/view-data-contracts/C-41-preview-invitations.md). F31 [proposed, critic M-04]; moves the analysis
// from lifecycle `preparation` to `preview` and notifies the reviewers.

export const c41RequestSchema = z
  .object({
    reviewerIds: z.array(userIdSchema).min(1),
  })
  .strict();

export const c41ResponseSchema = z
  .object({
    invited: z.boolean(),
    invitationIds: z.array(invitationIdSchema),
    sentAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C41Request = z.infer<typeof c41RequestSchema>;
export type C41Response = z.infer<typeof c41ResponseSchema>;
