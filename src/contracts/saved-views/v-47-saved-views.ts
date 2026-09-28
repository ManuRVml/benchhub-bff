import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { savedViewIdSchema, snapshotIdSchema } from '../common/ids.js';
import { kviBandSchema, kviCategoryIdSchema } from '../value-monitor/shared.js';
import { historyRangeSchema } from '../value-monitor/v-29-value-monitor-history.js';

// V-47 — Saved views [proposed, critic M-07]: GET /api/v1/views/saved-views
// (docs/requirements/view-data-contracts/V-47-saved-views.md). The caller's saved views of a screen, newest first;
// SCR-11 "Mis vistas". Single-module view (CF-97).

/** Stored Monitor URL state (`corte`, `historico`, `categoria[]`, `cumplimiento[]`), the only screen in v1. */
export const valueMonitorViewStateSchema = z
  .object({
    corte: snapshotIdSchema,
    historico: historyRangeSchema,
    categoria: z.array(kviCategoryIdSchema),
    cumplimiento: z.array(kviBandSchema),
  })
  .strict();

export const v47ResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: savedViewIdSchema,
          name: z.string().min(1),
          createdAt: z.iso.datetime({ offset: true }),
          state: valueMonitorViewStateSchema,
        })
        .strict(),
    ),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V47Response = z.infer<typeof v47ResponseSchema>;

/** Query: `screen` (required); `value-monitor` is the only screen with saved views in v1. */
export const v47QuerySchema = z.object({ screen: z.enum(['value-monitor']) }).strict();

export type V47Query = z.infer<typeof v47QuerySchema>;
