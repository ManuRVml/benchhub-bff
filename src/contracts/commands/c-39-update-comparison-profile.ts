import { z } from 'zod';

import { companyIdSchema, profileIdSchema } from '../common/ids.js';

// C-39 — Update comparison profile: PATCH /api/v1/comparison-profiles/:profileId
// (docs/requirements/view-data-contracts/C-39-update-comparison-profile.md). F17.
// PATCH semantics: every field is optional; a sent `companyIds` replaces the list.

export const c39RequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    companyIds: z.array(companyIdSchema).min(1).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const c39ResponseSchema = z
  .object({
    saved: z.boolean(),
    profileId: profileIdSchema,
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C39Request = z.infer<typeof c39RequestSchema>;
export type C39Response = z.infer<typeof c39ResponseSchema>;
