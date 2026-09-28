import { z } from 'zod';

import { notificationIdSchema } from '../common/ids.js';

// C-35 — Mark notification as read: PATCH /api/v1/notifications/:notificationId/read
// (docs/requirements/view-data-contracts/C-35-mark-notification-read.md). F34.

export const c35RequestSchema = z.object({}).strict();

export const c35ResponseSchema = z
  .object({
    read: z.boolean(),
    notificationId: notificationIdSchema,
    readAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C35Request = z.infer<typeof c35RequestSchema>;
export type C35Response = z.infer<typeof c35ResponseSchema>;
