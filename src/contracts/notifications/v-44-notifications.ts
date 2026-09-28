import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { notificationIdSchema } from '../common/ids.js';
import { pageSchema } from '../common/page.js';
import { commaListSchema, queryIntSchema } from '../common/query.js';

// V-44 — Notifications: GET /api/v1/views/notifications (docs/requirements/view-data-contracts/V-44-notifications.md).
// SCR-15 list, filtered by the caller's access (§1.19), sorted by createdAt desc. Single-module view (CF-97).

/** Notification type (V2 `ALERTS`); the front maps it to the icon and eyebrow label. */
export const notificationTypeSchema = z.enum([
  'dato',
  'comentario',
  'publicacion',
  'ia',
  'noticia',
  'colaboracion',
  'sistema',
]);

/** Severity; chip labels "Info" / "OK" / "Atención" / "Crítico" are front-only. */
export const notificationSeveritySchema = z.enum(['info', 'success', 'warn', 'error']);

export const v44NotificationSchema = z
  .object({
    id: notificationIdSchema,
    type: notificationTypeSchema,
    severity: notificationSeveritySchema,
    text: z.string(),
    createdAt: z.iso.datetime({ offset: true }),
    isRead: z.boolean(),
    /** Deep link to the related entity; null when there is none. */
    target: z
      .object({ route: z.string().startsWith('/') })
      .strict()
      .nullable(),
  })
  .strict();

export const v44ResponseSchema = pageSchema(v44NotificationSchema)
  .extend({
    /** Same number as the header badge (V-01). */
    unreadCount: z.number().int().min(0),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V44Response = z.infer<typeof v44ResponseSchema>;

/** Query: `q` (URL `q`), `severity` (URL `severidad`, comma list, empty = all), `page` and `pageSize`. */
export const v44QuerySchema = z
  .object({
    q: z.string().default(''),
    severity: commaListSchema(notificationSeveritySchema),
    page: queryIntSchema.default(1),
    pageSize: queryIntSchema.default(20),
  })
  .strict();

export type V44Query = z.infer<typeof v44QuerySchema>;
