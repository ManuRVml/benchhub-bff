import { z } from 'zod';

import { quarterPeriodSchema } from '../analysis-definition/v-05-analysis-definition.js';
import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';
import { sectionResult } from '../common/section-result.js';
import { UnitCodeSchema } from '../common/units.js';

// V-24 — Indicator detail: GET /api/v1/views/indicator-detail/:analysisId/:indicatorId
// (docs/requirements/view-data-contracts/V-24-indicator-detail.md). SCR-10: `indicator` + `permissions` are the primary
// datum; kpis, series, insight and traceability load as independent SectionResults. The comments thread is V-26.

/** Query params: `origin` (URL `origen`) only drives the back link and the executive_viewer check. */
export const v24QuerySchema = z
  .object({ origin: z.enum(['resultados', 'visualizacion', 'presentacion']).optional() })
  .strict();

export const v24IndicatorSchema = z
  .object({
    id: indicatorIdSchema,
    label: z.string(),
    /** Units of the SCR-10 indicators (Crecimiento Producción is `kboe`, never `%`, CF-67). */
    unit: UnitCodeSchema.extract(['percent', 'kboe', 'ratio_x', 'usd_b', 'points']),
    /** Polarity-aware position vs the peer average; the front renders the title context from it. */
    contextKey: z.enum(['above_peers', 'below_peers']),
  })
  .strict();

export const v24KpisSchema = z
  .object({
    ecopetrol: z.number(),
    peerAvg: z.number(),
    geVsAvgPct: z.number(),
    deltaVsPeersPct: z.number(),
  })
  .strict();

const v24PeriodSchema = z.object({ label: z.string().min(1) }).strict();

export const v24SeriesRowSchema = z
  .object({
    companyId: companyIdSchema,
    name: z.string(),
    isEcopetrol: z.boolean(),
    /** CF-134: values of the two compared periods (labels in `periods`). */
    previous: z.number(),
    current: z.number(),
    /** Change between the two periods in percent, 1 decimal. */
    deltaPct: z.number(),
  })
  .strict();

export const v24SeriesSchema = z
  .object({
    /** CF-134: display labels of the compared periods, e.g. "T4 2024" / "T4 2025" (CF-76). */
    periods: z
      .object({
        previous: v24PeriodSchema,
        current: v24PeriodSchema,
      })
      .strict(),
    rows: z.array(v24SeriesRowSchema),
    peerAvgCurrent: z.number(),
  })
  .strict();

export const v24InsightSchema = z
  .object({
    text: z.string(),
    // The insight is an AI suggestion (CF-40); no other state is defined for v1.
    status: z.enum(['suggestion']),
  })
  .strict();

export const v24HistoryEntrySchema = z
  .object({
    text: z.string(),
    occurredAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const v24TraceabilitySchema = z
  .object({
    source: z.string(),
    period: quarterPeriodSchema,
    updatedAt: z.iso.datetime({ offset: true }),
    history: z.array(v24HistoryEntrySchema),
  })
  .strict();

export const v24ResponseSchema = z
  .object({
    indicator: v24IndicatorSchema,
    kpis: sectionResult(v24KpisSchema),
    series: sectionResult(v24SeriesSchema),
    insight: sectionResult(v24InsightSchema),
    traceability: sectionResult(v24TraceabilitySchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export const V24_SECTIONS = ['kpis', 'series', 'insight', 'traceability'] as const;

export type V24Query = z.infer<typeof v24QuerySchema>;
export type V24Response = z.infer<typeof v24ResponseSchema>;
