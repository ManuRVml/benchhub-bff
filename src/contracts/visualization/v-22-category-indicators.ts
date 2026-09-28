import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { categoryIdSchema, indicatorIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

import { tierIdSchema } from './visualization-shared.js';

// V-22 — Category indicators: GET /api/v1/views/category-indicators/:analysisId (SCR-09 indicator panel).
// Bare payload; a failure is the endpoint ApiError (CF-128).

/** Query of the GET: the selected category (URL `categoria`). */
export const v22RequestSchema = z
  .object({ category: categoryIdSchema.default(categoryIdSchema.parse('rentabilidad')) })
  .strict();

export const v22RowSchema = z
  .object({
    indicatorId: indicatorIdSchema,
    code: z.string(),
    label: z.string(),
    unit: UnitCodeSchema,
    /** `growth` values get a sign in the front (SCR-09 A7); `level` values do not. */
    valueKind: z.enum(['level', 'growth']),
    /** CF-131: `null` when there is no published value (CF-37: never 0); the front renders "—". */
    ecopetrol: z.number().nullable(),
    peerAvg: z.number().nullable(),
    tierId: tierIdSchema,
    hasDetail: z.boolean(),
  })
  .strict();

export const v22ResponseSchema = z
  .object({
    category: z.object({ id: categoryIdSchema, label: z.string(), message: z.string() }).strict(),
    rows: z.array(v22RowSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V22Request = z.infer<typeof v22RequestSchema>;
export type V22Response = z.infer<typeof v22ResponseSchema>;
