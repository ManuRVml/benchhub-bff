import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';

// V-01 — Shell status: GET /api/v1/views/shell-status (docs/requirements/view-data-contracts/V-01-shell-status.md).
// Unread notifications badge of the app shell; independent of A-04 and refreshed often. A failure only hides the badge.

export const v01ResponseSchema = z
  .object({
    unreadNotifications: z.number().int().min(0),
    // No flags: every authenticated role sees its own count.
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V01Response = z.infer<typeof v01ResponseSchema>;
