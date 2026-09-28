import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { categoryIdSchema, indicatorIdSchema } from '../common/ids.js';
import { commaListSchema } from '../common/query.js';
import { UnitCodeSchema } from '../common/units.js';

import { categoryRefSchema, singleHorizonSchema } from './results-shared.js';

// V-13 — Report summary: GET /api/v1/views/report-summary/:analysisId (SCR-08 module 10).

export const v13RowSchema = z
  .object({
    category: z
      .object({
        id: categoryIdSchema,
        label: z.string(),
        // Engine tier of the category, 1 to 4.
        tier: z.number().int().min(1).max(4),
      })
      .strict(),
    indicatorId: indicatorIdSchema,
    label: z.string(),
    unit: UnitCodeSchema,
    geValue: z.number(),
    peerAvg: z.number(),
  })
  .strict();

export const v13ResponseSchema = z
  .object({
    categoryOptions: z.array(categoryRefSchema),
    rows: z.array(v13RowSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V13Response = z.infer<typeof v13ResponseSchema>;

// Query: `horizon` (URL `horizonte`; the module is hidden in `union`) and `categories` (URL `resumen`, comma-separated
// CategoryId list; empty or absent = all).
export const v13QuerySchema = z
  .object({
    horizon: singleHorizonSchema.default('tbg'),
    categories: commaListSchema(categoryIdSchema),
  })
  .strict();

export type V13Query = z.infer<typeof v13QuerySchema>;
