import { z } from 'zod';

import { savedViewIdSchema } from '../common/ids.js';

// C-20 — Delete saved view: DELETE /api/v1/saved-views/:viewId
// (docs/requirements/view-data-contracts/C-20-delete-saved-view.md). F36. The contract shows an empty request body.

export const c20RequestSchema = z.object({}).strict();

export const c20ResponseSchema = z
  .object({
    deleted: z.boolean(),
    viewId: savedViewIdSchema,
  })
  .strict();

export type C20Request = z.infer<typeof c20RequestSchema>;
export type C20Response = z.infer<typeof c20ResponseSchema>;
