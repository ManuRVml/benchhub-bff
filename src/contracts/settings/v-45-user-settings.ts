import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';

// V-45 — User settings: GET /api/v1/views/user-settings (docs/requirements/view-data-contracts/V-45-user-settings.md).
// SCR-16 profile card, accessibility (font scale + high contrast) and the email preference. Every role edits its own
// settings (empty permissions); C-37 saves them. Single-module view (CF-97).

/** OQ-20 / CF-115: the three font scales, A- / A / A+. */
export const fontScaleSchema = z.union([z.literal(0.9), z.literal(1), z.literal(1.1)]);

export const v45ResponseSchema = z
  .object({
    profile: z
      .object({
        displayName: z.string(),
        /** Label of the resolved role (§1.19), e.g. "Analista creador". */
        roleLabel: z.string(),
        area: z.string(),
      })
      .strict(),
    accessibility: z
      .object({
        /** Current font scale; one of `fontScaleOptions` (OQ-20: 0.9 / 1 / 1.1 for A- / A / A+). */
        fontScale: fontScaleSchema,
        fontScaleOptions: z.array(fontScaleSchema).min(1),
        highContrast: z.boolean(),
      })
      .strict(),
    /** Stored only in v1 (no email backend, OQ-20). */
    emailNotifications: z.boolean(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V45Response = z.infer<typeof v45ResponseSchema>;
