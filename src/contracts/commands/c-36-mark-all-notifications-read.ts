import { z } from 'zod';

// C-36 — Mark all notifications as read: POST /api/v1/notifications/read-all
// (docs/requirements/view-data-contracts/C-36-mark-all-notifications-read.md). F34; resets the unread count to 0.

export const c36RequestSchema = z.object({}).strict();

export const c36ResponseSchema = z
  .object({
    read: z.boolean(),
    /** Number of notifications marked as read. */
    count: z.number().int().min(0),
  })
  .strict();

export type C36Request = z.infer<typeof c36RequestSchema>;
export type C36Response = z.infer<typeof c36ResponseSchema>;
