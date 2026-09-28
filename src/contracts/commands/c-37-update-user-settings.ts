import { z } from 'zod';

import { fontScaleSchema, v45ResponseSchema } from '../settings/v-45-user-settings.js';

// C-37 — Update user settings: PATCH /api/v1/user-settings
// (docs/requirements/view-data-contracts/C-37-update-user-settings.md). F35; accessibility and email preferences.

/**
 * CF-115: the editable V-45 settings, flat: font scale (0.9 | 1 | 1.1), high contrast and the email preference. The
 * prose's error list still names the old `fontSize` / `digest` fields (listed as a divergence).
 */
export const userSettingsSchema = z
  .object({
    fontScale: fontScaleSchema,
    highContrast: v45ResponseSchema.shape.accessibility.shape.highContrast,
    emailNotifications: v45ResponseSchema.shape.emailNotifications,
  })
  .strict();

/** PATCH semantics: every field optional. */
export const c37RequestSchema = userSettingsSchema.partial().strict();

/**
 * The stored settings after the patch. CF-115 says "the full V-45 settings"; the contract example is these three
 * fields only (no profile, options or permissions), and the example wins on presence.
 */
export const c37ResponseSchema = userSettingsSchema;

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type C37Request = z.infer<typeof c37RequestSchema>;
export type C37Response = z.infer<typeof c37ResponseSchema>;
