import { z } from 'zod';

import { profileIdSchema } from '../common/ids.js';

// C-40 — Delete comparison profile: DELETE /api/v1/comparison-profiles/:profileId
// (docs/requirements/view-data-contracts/C-40-delete-comparison-profile.md). F17; the default profile cannot be deleted.
// No query parameters: the request (published as the query of the DELETE) is empty.

export const c40RequestSchema = z.object({}).strict();

export const c40ResponseSchema = z
  .object({
    deleted: z.boolean(),
    profileId: profileIdSchema,
  })
  .strict();

export type C40Request = z.infer<typeof c40RequestSchema>;
export type C40Response = z.infer<typeof c40ResponseSchema>;
