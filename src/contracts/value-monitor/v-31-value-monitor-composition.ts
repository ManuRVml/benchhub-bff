import { ActionPermissionsSchema } from '../common/action-permissions.js';

import { valueMonitorCompositionSchema } from './shared.js';
import { valueMonitorSnapshotQuerySchema } from './v-27-value-monitor.js';

import type { z } from 'zod';

// V-31 — Value monitor composition: GET /api/v1/views/value-monitor-composition
// (docs/requirements/view-data-contracts/V-31-value-monitor-composition.md). SCR-11 donut + category table; the data is
// the shape C-16 returns as `composition` (CF-103), plus the (empty) permissions. Single-module view (CF-97).

export const v31ResponseSchema = valueMonitorCompositionSchema
  .extend({ permissions: ActionPermissionsSchema })
  .strict();

export type V31Response = z.infer<typeof v31ResponseSchema>;

/** Query: `snapshot` (URL `corte`, absent = latest). */
export const v31QuerySchema = valueMonitorSnapshotQuerySchema;

export type V31Query = z.infer<typeof v31QuerySchema>;
