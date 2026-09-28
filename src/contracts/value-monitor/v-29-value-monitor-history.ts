import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { indicatorIdSchema, snapshotIdSchema } from '../common/ids.js';

import {
  DEFAULT_MONITOR_INDICATOR,
  monitorIndicatorRefSchema,
} from './v-28-value-monitor-peer-ranking.js';

// V-29 — Value monitor history: GET /api/v1/views/value-monitor-history
// (docs/requirements/view-data-contracts/V-29-value-monitor-history.md). SCR-11 "Comparación con serie histórica":
// Ecopetrol's real series per year; missing years are omitted, never zero-filled. Single-module view (CF-97).

/** Year window: Actual 2024–2025, 5y 2021–2025, 8y 2018–2025, 10y 2016–2025. */
export const historyRangeSchema = z.enum(['actual', '5y', '8y', '10y']);

export const v29ResponseSchema = z
  .object({
    indicator: monitorIndicatorRefSchema,
    range: historyRangeSchema,
    points: z.array(z.object({ year: z.number().int(), value: z.number() }).strict()),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V29Response = z.infer<typeof v29ResponseSchema>;

/** Query: `indicator` (default ROACE), `range` (URL `historico`, default `actual`), `snapshot` (URL `corte`). */
export const v29QuerySchema = z
  .object({
    indicator: indicatorIdSchema.default(DEFAULT_MONITOR_INDICATOR),
    range: historyRangeSchema.default('actual'),
    snapshot: snapshotIdSchema.optional(),
  })
  .strict();

export type V29Query = z.infer<typeof v29QuerySchema>;
