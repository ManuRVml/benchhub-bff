import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';

// V-02 — Admin home: GET /api/v1/views/admin-home (docs/requirements/view-data-contracts/V-02-admin-home.md).
// The five back-office modules and their availability (SCR-03); every module is unavailable in v1. Requires
// hasAdminAccess (else 403). Titles, descriptions and icons come from the front's i18n keyed by `id`.

export const adminModuleIdSchema = z.enum([
  'users-roles',
  'data-sources',
  'companies-peers',
  'system-parameters',
  'audit',
]);

export const v02ResponseSchema = z
  .object({
    cards: z.array(
      z
        .object({
          id: adminModuleIdSchema,
          // Module shipped and the user holds the matching canManage* flag.
          isAvailable: z.boolean(),
        })
        .strict(),
    ),
    // canManageUsers, canManageDataSources, canManageCompanies, canManageParameters, canViewAudit (all false in v1).
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V02Response = z.infer<typeof v02ResponseSchema>;
