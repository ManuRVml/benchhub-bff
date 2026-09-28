import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema } from '../common/ids.js';

// V-16 — Future aspiration 2040+: GET /api/v1/views/future-aspiration/:analysisId (SCR-08 module 6, gated).
// Production in kbpe/d. Bare payload; a failure is the endpoint ApiError (CF-121).

/** Production segments of a company (kbpe/d); `total` is their sum. */
export const v16SegmentIdSchema = z.enum(['crude', 'gas', 'unconventional', 'lowEmissions']);

/** Segment chip selected in the module: the four segments or `total`. */
export const v16SelectedSegmentSchema = z.enum([
  'total',
  'crude',
  'gas',
  'unconventional',
  'lowEmissions',
]);

/** Query of the GET: the module-local segment chip. */
export const v16RequestSchema = z
  .object({ segment: v16SelectedSegmentSchema.default('total') })
  .strict();

const kbped = z.number().min(0);

export const v16RowSchema = z
  .object({
    rank: z.number().int().min(1),
    companyId: companyIdSchema,
    name: z.string(),
    isEcopetrol: z.boolean(),
    segments: z
      .object({ crude: kbped, gas: kbped, unconventional: kbped, lowEmissions: kbped })
      .strict(),
    total: kbped,
  })
  .strict();

export const v16ResponseSchema = z
  .object({
    tiles: z
      .object({
        ecopetrolProductionKbped: kbped,
        totalRank: z.number().int().min(1),
        of: z.number().int().min(1),
        lowEmissionsSharePct: z
          .object({ ecopetrol: z.number().min(0).max(100), peers: z.number().min(0).max(100) })
          .strict(),
      })
      .strict(),
    segments: z.array(
      z.object({ id: v16SegmentIdSchema, labelKey: z.string(), colorKey: z.string() }).strict(),
    ),
    segment: v16SelectedSegmentSchema,
    rows: z.array(v16RowSchema),
    footnoteKey: z.string(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V16Request = z.infer<typeof v16RequestSchema>;
export type V16Response = z.infer<typeof v16ResponseSchema>;
