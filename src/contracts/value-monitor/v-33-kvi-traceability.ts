import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { kviIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

import { valueMonitorSnapshotQuerySchema } from './v-27-value-monitor.js';

// V-33 — KVI traceability: GET /api/v1/views/kvi-traceability/:kviId (OVL-11). The prose calls the modal one
// SectionResult; the example is the bare payload (the example wins for shape).

/** Query: `snapshot`; absent = the latest snapshot (the capture date is snapshot-specific). */
export const v33RequestSchema = valueMonitorSnapshotQuerySchema;

export const v33ResponseSchema = z
  .object({
    kviId: kviIdSchema,
    label: z.string(),
    categoryLabel: z.string(),
    source: z.string(),
    capturedAt: z.iso.date(),
    /** `null` when the KVI has no owner (the front shows "—"). */
    owner: z.string().nullable(),
    unit: UnitCodeSchema,
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V33Request = z.infer<typeof v33RequestSchema>;
export type V33Response = z.infer<typeof v33ResponseSchema>;
