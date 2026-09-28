import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { indicatorIdSchema } from '../common/ids.js';
import { commaListSchema } from '../common/query.js';
import { UnitCodeSchema } from '../common/units.js';

// V-07 — Indicator catalog (wizard step 3): GET /api/v1/views/indicator-catalog
// (docs/requirements/view-data-contracts/V-07-indicator-catalog.md). One source per call (query `source`, `concepts`,
// `horizons`); stable ids plus display-only codes (CF-77).

export const indicatorSourceSchema = z.enum(['pares', 'tbg_ilp']);
export const planningConceptSchema = z.enum([
  'rentabilidad',
  'liquidez',
  'operacional',
  'solvencia',
  'opex',
]);
export const tbgDimensionSchema = z.enum(['financiero', 'operativo', 'transversal']);
export const horizonSchema = z.enum(['tbg', 'ilp']);

// Pares items carry `concept` and `horizon: null`; TBG/ILP items carry `dimension` instead of `concept` and a horizon
// (prose). Both keys are optional so one item schema serves both sources.
export const v07IndicatorSchema = z
  .object({
    id: indicatorIdSchema,
    code: z.string().min(1),
    label: z.string(),
    unit: UnitCodeSchema,
    concept: planningConceptSchema.optional(),
    dimension: tbgDimensionSchema.optional(),
    horizon: horizonSchema.nullable(),
    sources: z.array(z.string().min(1)),
  })
  .strict();

export const v07GroupSchema = z
  .object({
    id: z.string().min(1),
    label: z.string(),
    items: z.array(v07IndicatorSchema),
  })
  .strict();

export const v07ResponseSchema = z
  .object({
    source: indicatorSourceSchema,
    groups: z.array(v07GroupSchema),
    totals: z
      .object({
        groups: z.number().int().min(0),
        indicators: z.number().int().min(0),
      })
      .strict(),
    filterOptions: z
      .object({
        concepts: z.array(planningConceptSchema),
        horizons: z.array(horizonSchema),
      })
      .strict(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V07Response = z.infer<typeof v07ResponseSchema>;

// Query: `concepts` applies to source=pares and `horizons` to source=tbg_ilp; empty = all. The prose does not say what
// the other source does with them, so they are accepted with any source and ignored by the handler.
export const v07QuerySchema = z
  .object({
    source: indicatorSourceSchema.default('pares'),
    concepts: commaListSchema(planningConceptSchema),
    horizons: commaListSchema(horizonSchema),
  })
  .strict();

export type V07Query = z.infer<typeof v07QuerySchema>;
