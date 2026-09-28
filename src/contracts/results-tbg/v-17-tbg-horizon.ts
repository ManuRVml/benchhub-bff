import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, indicatorIdSchema } from '../common/ids.js';
import { dimensionSchema, horizonSchema } from '../results/results-shared.js';

// V-17 — TBG / ILP horizon: GET /api/v1/views/tbg-horizon/:analysisId (SCR-08 module 7, OVL-15, S-UNION panel).
// CF-121: bare payload per module, a failure is the endpoint ApiError; each block is `null` when not requested for the
// current `horizon` / `view` / `detail` (or when the PO disables the gated summary sub-blocks).

/** Company weight sum vs 100 %: `ok` within 99,5–100,5, `over`, `under`. */
export const v17SumStatusSchema = z.enum(['ok', 'over', 'under']);

/** Query of the GET: horizon (URL `horizonte`), module tab, editor / union / OVL-15 company and the OVL-15 flag. */
export const v17RequestSchema = z
  .object({
    horizon: horizonSchema.default('tbg'),
    view: z.enum(['summary', 'company']).default('summary'),
    companyId: companyIdSchema.optional(),
    // Query strings: only "true" / "false" (published as that enum), parsed to a boolean.
    detail: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .strict();

const pct = z.number().min(0);

export const v17CompositionRowSchema = z
  .object({
    companyId: companyIdSchema,
    name: z.string(),
    finPct: pct,
    opPct: pct,
    transPct: pct,
    /** Hybrid Financiera/Operativa dimension; `null` for companies without it. */
    finOpPct: pct.nullable(),
    totalPct: pct,
    sumStatus: v17SumStatusSchema,
  })
  .strict();

export const v17FocusSchema = z
  .object({
    title: z.string().nullable(),
    items: z.array(
      z.object({ companyId: companyIdSchema, label: z.string(), weightPct: pct }).strict(),
    ),
    ecopetrolText: z.string().nullable(),
    ecopetrolStatus: z.enum(['defined', 'in_definition']),
  })
  .strict();

export const v17SummarySchema = z
  .object({
    kpis: z
      .object({
        companies: z.number().int().min(0),
        avgFinPct: z.number().int().min(0),
        avgOpPct: z.number().int().min(0),
        avgTransPct: z.number().int().min(0),
      })
      .strict(),
    composition: z.array(v17CompositionRowSchema),
    mainIndicators: z.array(
      z.object({ dimension: dimensionSchema, foci: z.array(v17FocusSchema) }).strict(),
    ),
    /** Dropped widget (critic M-02, CF-87): always `null` in v1, kept optional so the PO can re-enable it. */
    topIndicators: z.null().optional(),
  })
  .strict();

/** A declared weight of a TBG / ILP scheme; a hito (`isHito`) lists its components in `subItems`. */
export const v17WeightItemSchema = z
  .object({
    label: z.string(),
    weightPct: pct,
    isHito: z.boolean(),
    subItems: z.array(z.string()),
  })
  .strict();

export const v17CompanyEditorSchema = z
  .object({
    companyId: companyIdSchema,
    groups: z.array(
      z
        .object({
          dimension: dimensionSchema,
          totalPct: pct,
          items: z.array(v17WeightItemSchema.extend({ indicatorId: indicatorIdSchema }).strict()),
        })
        .strict(),
    ),
    totalPct: pct,
    sumStatus: v17SumStatusSchema,
  })
  .strict();

const v17DimensionBlockSchema = z
  .object({ dimension: dimensionSchema, totalPct: pct, items: z.array(v17WeightItemSchema) })
  .strict();

export const v17UnionSchema = z
  .object({
    companyId: companyIdSchema,
    companyOptions: z.array(
      z.object({ id: companyIdSchema, name: z.string(), hasIlp: z.boolean() }).strict(),
    ),
    tbg: z
      .object({
        dims: z.array(v17DimensionBlockSchema),
        totalPct: pct,
        indicatorCount: z.number().int().min(0),
      })
      .strict(),
    /** `null` for companies without ILP data (no Shell fallback, SCR-08 A2). */
    ilp: z
      .object({
        dims: z.array(v17DimensionBlockSchema),
        totalPct: pct,
        indicatorCount: z.number().int().min(0),
        hitoCount: z.number().int().min(0),
      })
      .strict()
      .nullable(),
  })
  .strict();

/** OVL-15 "Detalle por compañía (TBG e ILP)", present when `detail=true`. */
export const v17CompanyDetailSchema = z
  .object({
    companyId: companyIdSchema,
    name: z.string(),
    tbg: z
      .object({
        indicatorCount: z.number().int().min(0),
        dims: z.array(
          z
            .object({
              dimension: dimensionSchema,
              totalPct: pct,
              items: z.array(z.object({ label: z.string(), weightPct: pct }).strict()),
            })
            .strict(),
        ),
      })
      .strict(),
    ilp: z
      .object({
        indicatorCount: z.number().int().min(0),
        hitoCount: z.number().int().min(0),
        dims: z.array(v17DimensionBlockSchema),
      })
      .strict()
      .nullable(),
  })
  .strict();

export const v17ResponseSchema = z
  .object({
    horizon: horizonSchema,
    summary: v17SummarySchema.nullable(),
    companyEditor: v17CompanyEditorSchema.nullable(),
    union: v17UnionSchema.nullable(),
    companyDetail: v17CompanyDetailSchema.nullable(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V17Request = z.infer<typeof v17RequestSchema>;
export type V17Response = z.infer<typeof v17ResponseSchema>;
