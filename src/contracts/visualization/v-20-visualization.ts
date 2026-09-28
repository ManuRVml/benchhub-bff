import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { categoryIdSchema, companyIdSchema } from '../common/ids.js';
import { sectionResult } from '../common/section-result.js';
import { dimensionSchema } from '../results/results-shared.js';

import { dimensionWeightsSchema, sumStatusSchema, tierIdSchema } from './visualization-shared.js';

// V-20 — Visualization dashboard: GET /api/v1/views/visualization/:analysisId (SCR-09). Five independent sections;
// `lifecycleState`, `position` and `permissions` are the primary datum (the page fails as a whole without them).

/** Report lifecycle (critic M-04 [proposed]): analyst preparation, reviewer preview, published. */
export const v20LifecycleStateSchema = z.enum(['preparation', 'preview', 'published']);

export const v20PositionSchema = z
  .object({
    tierId: tierIdSchema,
    periodLabel: z
      .object({
        year: z.number().int().min(2000).max(2100),
        quarter: z.number().int().min(1).max(4),
      })
      .strict(),
    indicatorCount: z.number().int().min(0),
    peerCount: z.number().int().min(0),
  })
  .strict();

export const v20KpiTileSchema = z
  .object({
    dimension: dimensionSchema,
    sectorAvg: z.number().min(0),
    ecopetrol: z.number().min(0),
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .strict();

export const v20HeatmapRowSchema = z
  .object({
    companyId: companyIdSchema,
    name: z.string(),
    isEcopetrol: z.boolean(),
    fin: z.number().min(0),
    op: z.number().min(0),
    trans: z.number().min(0),
  })
  .strict();

export const v20RadarSchema = z
  .object({
    axes: z.array(dimensionSchema),
    ecopetrol: z.array(z.number().min(0)),
    sector: z.array(z.number().min(0)),
  })
  .strict();

export const v20CategoryCardSchema = z
  .object({ id: categoryIdSchema, label: z.string(), tierId: tierIdSchema, message: z.string() })
  .strict();

export const v20WeightCompositionSchema = z
  .object({
    ecopetrol: dimensionWeightsSchema,
    /** Ecopetrol − group average, signed points. */
    diffs: z.object({ fin: z.number(), op: z.number(), trans: z.number() }).strict(),
    companies: z.array(
      z
        .object({
          companyId: companyIdSchema,
          name: z.string(),
          fin: z.number().min(0),
          op: z.number().min(0),
          trans: z.number().min(0),
          totalPct: z.number().min(0),
          sumStatus: sumStatusSchema,
        })
        .strict(),
    ),
    groupAvg: dimensionWeightsSchema,
    hasOverweight: z.boolean(),
    lineLegend: z.array(
      z.object({ code: z.string(), dimension: dimensionSchema, formula: z.string() }).strict(),
    ),
  })
  .strict();

export const v20ResponseSchema = z
  .object({
    lifecycleState: v20LifecycleStateSchema,
    position: v20PositionSchema,
    kpiTiles: sectionResult(z.array(v20KpiTileSchema)),
    heatmap: sectionResult(z.array(v20HeatmapRowSchema)),
    radar: sectionResult(v20RadarSchema),
    categories: sectionResult(z.array(v20CategoryCardSchema)),
    weightComposition: sectionResult(v20WeightCompositionSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V20Response = z.infer<typeof v20ResponseSchema>;

export const V20_SECTIONS = [
  'kpiTiles',
  'heatmap',
  'radar',
  'categories',
  'weightComposition',
] as const;
