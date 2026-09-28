import { z } from 'zod';

import { kviIdSchema } from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

// Monitor de Valor shapes shared by C-16 (CF-103) and the views V-27 (kpis), V-30 (rows) and V-31 (composition).
// Defined here from the C-16 example and the V-27 / V-30 / V-31 prose; row P3-08a imports them for those views.

/** KVI categories of the Monitor (ids are data slugs from the contracts; labels come in `categoryLabel` / `label`). */
export const kviCategoryIdSchema = z.enum([
  'financiero',
  'mercado',
  'estrategico',
  'grupos_interes',
]);

/** Compliance band (V-30): ≥ 90 `ok`, 70–89 `watch`, < 70 `risk`, no data `tbd`. */
export const kviBandSchema = z.enum(['ok', 'watch', 'risk', 'tbd']);

/** One KVI table row (V-30 `rows[]` item). Missing values are null, never 0. */
export const kviRowSchema = z
  .object({
    kviId: kviIdSchema,
    code: z.string().min(1),
    category: kviCategoryIdSchema,
    categoryLabel: z.string(),
    label: z.string(),
    /** The KVI units of the V-30 prose (CF-127: `ratio_x`, not `times`). */
    unit: UnitCodeSchema.extract([
      'percent',
      'ratio_x',
      'bcop',
      'mmcop',
      'musd',
      'cop',
      'cop_per_kwh',
      'rating',
    ]),
    weightPct: z.number().min(0).max(100).nullable(),
    owner: z.string(),
    meta: z.number().nullable(),
    metaReto: z.number().nullable(),
    real: z.number().nullable(),
    // Text-mode KVIs (e.g. a credit rating) carry their values as text; `resultPct` is fixed at 100.
    metaText: z.string().optional(),
    metaRetoText: z.string().optional(),
    realText: z.string().optional(),
    /** round(Real / Meta × 100), or Meta / Real when lower is better; floor 0, not capped. */
    resultPct: z.number().int().min(0).nullable(),
    retoPct: z.number().int().min(0).nullable(),
    resultBand: kviBandSchema,
    retoBand: kviBandSchema,
    isTbd: z.boolean(),
    isTextMode: z.boolean(),
    lowerIsBetter: z.boolean(),
    isEditable: z.boolean(),
  })
  .strict();

/** Headline tiles (V-27 `kpis.data`): engine aggregates, the front only formats them. */
export const valueMonitorKpisSchema = z
  .object({
    globalPct: z.number().min(0),
    retoPct: z.number().min(0),
    atRiskCount: z.number().int().min(0),
    tbdCount: z.number().int().min(0),
  })
  .strict();

/** Composition donut and table (V-31 data). `centerPct` equals `kpis.globalPct`. */
export const valueMonitorCompositionSchema = z
  .object({
    centerPct: z.number().min(0),
    categories: z.array(
      z
        .object({
          id: kviCategoryIdSchema,
          label: z.string(),
          /** Colour token path, e.g. `chart.category.financiero`. */
          colorKey: z.string().min(1),
          weightPct: z.number().min(0).max(100),
          kviCount: z.number().int().min(0),
          compliancePct: z.number().min(0).nullable(),
        })
        .strict(),
    ),
  })
  .strict();

export type KviRow = z.infer<typeof kviRowSchema>;
export type ValueMonitorKpis = z.infer<typeof valueMonitorKpisSchema>;
export type ValueMonitorComposition = z.infer<typeof valueMonitorCompositionSchema>;
