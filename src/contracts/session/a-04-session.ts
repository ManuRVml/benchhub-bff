import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { analysisIdSchema, fileIdSchema, userIdSchema } from '../common/ids.js';

import { inAppPathSchema, roleSchema } from './auth-shared.js';

// A-04 — Session: GET /api/v1/session (docs/requirements/view-data-contracts/A-04-session.md).
// First SPA call after landing and after every reload; 401 = no session. Single object, no SectionResult: if it fails
// the whole app fails. Everything is derived by the BFF from the Entra identity and group mapping.

export const a04NavigationItemSchema = z
  .object({
    id: z.string().min(1),
    labelKey: z.string().min(1),
    // Target decided by the BFF per role (e.g. Ref. Competitivo → Resultados for the analyst, Visualización otherwise).
    to: inAppPathSchema,
    isLocked: z.boolean(),
  })
  .strict();

export const a04ResponseSchema = z
  .object({
    user: z
      .object({
        id: userIdSchema,
        displayName: z.string(),
        // Fetched through O-03; null → initials [inference].
        avatarFileId: fileIdSchema.nullable(),
        roleLabelKey: z.string().min(1),
      })
      .strict(),
    role: roleSchema,
    hasAdminAccess: z.boolean(),
    // True only on the first session call after the callback, and only with hasAdminAccess.
    requiresGate: z.boolean(),
    navigation: z.array(a04NavigationItemSchema),
    analysisContext: z.object({ defaultAnalysisId: analysisIdSchema.nullable() }).strict(),
    // canUseAssistant, canCreateAnalysis, canViewAnalysisList, canUseAnalysisTabs.
    permissions: ActionPermissionsSchema,
    // Synchronizer CSRF token of BFF ADR-0004 §6 (sent back as X-CSRF-Token). The contract example has no such field
    // (it describes a double-submit XSRF-TOKEN cookie), so it is optional here; listed as a divergence of the row.
    csrfToken: z.string().min(1).optional(),
  })
  .strict();

export type A04Response = z.infer<typeof a04ResponseSchema>;
