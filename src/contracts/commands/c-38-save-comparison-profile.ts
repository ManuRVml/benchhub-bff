import { z } from 'zod';

import { companyIdSchema, profileIdSchema } from '../common/ids.js';

// C-38 — Save comparison profile: POST /api/v1/comparison-profiles
// (docs/requirements/view-data-contracts/C-38-save-comparison-profile.md). F17.

export const c38RequestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    companyIds: z.array(companyIdSchema).min(1),
    isDefault: z.boolean(),
  })
  .strict();

export const c38ResponseSchema = z
  .object({
    saved: z.boolean(),
    profileId: profileIdSchema,
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C38Request = z.infer<typeof c38RequestSchema>;
export type C38Response = z.infer<typeof c38ResponseSchema>;
