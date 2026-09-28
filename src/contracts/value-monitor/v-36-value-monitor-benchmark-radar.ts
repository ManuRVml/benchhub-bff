import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyColorKeySchema } from '../common/companies.js';
import { generatedBySchema } from '../common/generated-by.js';
import { companyIdSchema, kviIdSchema } from '../common/ids.js';
import { sectionResult } from '../common/section-result.js';

import { kviCategoryIdSchema } from './shared.js';

// V-36 — Value monitor benchmark radar: GET /api/v1/views/value-monitor-benchmark-radar (SCR-11 section 10, gated
// `benchmarkRadar`). CF-136: `radar`, `ranking` and `insight` are independent SectionResults; an insight failure keeps
// the radar and the ranking.

/** 1–5 comma-separated company ids (`a,b`); absent = Ecopetrol + Shell. Empty entries are rejected. */
const companiesQuerySchema = z
  .string()
  .regex(/^(?!,)(?!.*,,)(?!.*,$)./)
  .default('cmp_ecopetrol,cmp_shell')
  .transform((raw) => raw.split(','))
  .pipe(z.array(companyIdSchema).min(1).max(5));

/** Query of the GET: company toggles, year (absent = latest with data), category pill, previous-year comparison. */
export const v36RequestSchema = z
  .object({
    companies: companiesQuerySchema,
    year: z.coerce.number().int().min(1000).max(9999).optional(),
    category: z.enum(['all', ...kviCategoryIdSchema.options]).default('all'),
    // Query strings: only "true" / "false" (published as that enum), parsed to a boolean.
    compareWithPreviousYear: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .strict();

/** A radar or ranking value: min(Resultado Monitor, 100), normalised 0–100. */
const normalisedPct = z.number().min(0).max(100);

const kviRefSchema = z.object({ kviId: kviIdSchema, label: z.string() }).strict();

const year = z.number().int().min(1000).max(9999);

export const v36RadarSchema = z
  .object({
    axes: z.array(kviRefSchema),
    series: z.array(
      z
        .object({
          companyId: companyIdSchema,
          name: z.string(),
          year,
          /**
           * CF-137: the bare company slug, Ecopetrol included (`'ecopetrol'`, `shell`), as CF-98. The prose's
           * `chart.ecopetrol` / `company.*` token paths are stale (listed as a divergence).
           */
          colorKey: companyColorKeySchema,
          /** One value per axis, in axis order. */
          values: z.array(normalisedPct),
        })
        .strict(),
    ),
  })
  .strict();

export const v36RankingSchema = z
  .object({
    /** Ecopetrol's top 3 KVIs. */
    strengths: z.array(kviRefSchema.extend({ pct: normalisedPct }).strict()),
    /** Ecopetrol's bottom 3 KVIs. */
    opportunities: z.array(kviRefSchema.extend({ pct: normalisedPct }).strict()),
  })
  .strict();

/** AI suggestion (OQ-19); the tone follows the V-35 scale. */
export const v36InsightSchema = z
  .object({
    text: z.string(),
    tone: z.enum(['ok', 'watch', 'action']),
    status: z.literal('suggestion'),
    generatedBy: generatedBySchema,
  })
  .strict();

export const v36ResponseSchema = z
  .object({
    radar: sectionResult(v36RadarSchema),
    ranking: sectionResult(v36RankingSchema),
    insight: sectionResult(v36InsightSchema),
    companyOptions: z.array(z.object({ id: companyIdSchema, name: z.string() }).strict()),
    yearOptions: z.array(year),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export const V36_SECTIONS = ['radar', 'ranking', 'insight'] as const;

export type V36Request = z.infer<typeof v36RequestSchema>;
export type V36Response = z.infer<typeof v36ResponseSchema>;
