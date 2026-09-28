import { z } from 'zod';

/**
 * Actions the current user may perform on a view (brief §4.1.7): a map of permission flag → allowed.
 * No fixed key set in v1: each view declares its own keys (V-03 `canViewAnalysisList`, V-10 `canEditCoverage`, …), so a
 * shared closed object would either reject valid views or accept every key anyway. Views that need a closed set can
 * still declare `z.object({...}).strict()` locally.
 */
export const ActionPermissionsSchema = z.record(z.string(), z.boolean());

export type ActionPermissions = z.infer<typeof ActionPermissionsSchema>;
