import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, indicatorIdSchema, snapshotIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

import type { IndicatorId } from '../common/ids.js';

// V-28 — Value monitor peer ranking: GET /api/v1/views/value-monitor-peer-ranking
// (docs/requirements/view-data-contracts/V-28-value-monitor-peer-ranking.md). SCR-11 "Ranking de pares · ROACE": top 6
// of the latest period (CF-69), Ecopetrol always included. Single-module view: the bare payload (CF-97).

/** Only ROACE in v1. */
export const DEFAULT_MONITOR_INDICATOR = 'ind_roace' as IndicatorId;

export const monitorIndicatorRefSchema = z
  .object({ id: indicatorIdSchema, label: z.string(), unit: UnitCodeSchema })
  .strict();

export const v28ResponseSchema = z
  .object({
    indicator: monitorIndicatorRefSchema,
    periodLabel: z.string(),
    rows: z.array(
      z
        .object({
          rank: z.number().int().min(1),
          companyId: companyIdSchema,
          displayName: z.string(),
          value: z.number(),
          isEcopetrol: z.boolean(),
        })
        .strict(),
    ),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V28Response = z.infer<typeof v28ResponseSchema>;

/** Query: `indicator` (default ROACE, not in the URL) and `snapshot` (URL `corte`, absent = latest). */
export const v28QuerySchema = z
  .object({
    indicator: indicatorIdSchema.default(DEFAULT_MONITOR_INDICATOR),
    snapshot: snapshotIdSchema.optional(),
  })
  .strict();

export type V28Query = z.infer<typeof v28QuerySchema>;
