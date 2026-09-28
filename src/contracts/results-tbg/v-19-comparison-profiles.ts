import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema, profileIdSchema } from '../common/ids.js';

// V-19 — Comparison profiles: GET /api/v1/views/comparison-profiles/:analysisId (SCR-08 module 9, gated).
// Bare payload per module; a failure is the endpoint ApiError (CF-121). Oracle (critic K.3): Perfil 1, 2025, 40/25/35, Shell + Equinor → 77.2, −12.4, 3 of 3.

/** Business type of a profile (the options of the "Tipo de negocio" chips); CF-122: English snake_case. */
export const v19BusinessTypeSchema = z.enum([
  'all',
  'hydrocarbons',
  'upstream',
  'gas_lng',
  'decarbonization_renewables',
]);

/** Query of the GET: the module-local profile tab; absent = the first profile. */
export const v19RequestSchema = z.object({ profileId: profileIdSchema.optional() }).strict();

const year = z.number().int().min(2000).max(2100);
const weightPct = z.number().min(0).max(100);

export const v19ConfigSchema = z
  .object({
    profileId: profileIdSchema,
    name: z.string(),
    businessType: v19BusinessTypeSchema,
    businessTypeOptions: z.array(v19BusinessTypeSchema),
    indicators: z
      .object({ fin: z.array(z.string()), op: z.array(z.string()), trans: z.array(z.string()) })
      .strict(),
    validityYear: year,
    validityYearOptions: z.array(year),
    availablePeerIds: z.array(companyIdSchema),
    peerIds: z.array(companyIdSchema),
    weights: z.object({ fin: weightPct, op: weightPct, trans: weightPct }).strict(),
    weightsTotal: z.number().min(0),
  })
  .strict();

export const v19ResultSchema = z
  .object({
    score: z.number(),
    peerAvg: z.number(),
    gapPts: z.number(),
    position: z.number().int().min(1),
    of: z.number().int().min(1),
    ranking: z.array(
      z
        .object({
          companyId: companyIdSchema,
          name: z.string(),
          score: z.number(),
          isEcopetrol: z.boolean(),
        })
        .strict(),
    ),
    // The insight is an AI suggestion (prose: "insight — AI suggestion"); no other state is defined for v1.
    insight: z.object({ text: z.string(), status: z.enum(['suggestion']) }).strict(),
  })
  .strict();

export const v19SummaryRowSchema = z
  .object({
    profileId: profileIdSchema,
    name: z.string(),
    subtitle: z.string(),
    year,
    ecopetrolScore: z.number(),
    peerAvg: z.number(),
    gapPts: z.number(),
    position: z.number().int().min(1),
    of: z.number().int().min(1),
    isActive: z.boolean(),
  })
  .strict();

export const v19ResponseSchema = z
  .object({
    profiles: z.array(
      z
        .object({ id: profileIdSchema, name: z.string(), businessTypeId: v19BusinessTypeSchema })
        .strict(),
    ),
    config: v19ConfigSchema,
    result: v19ResultSchema,
    summaryTable: z.array(v19SummaryRowSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V19Request = z.infer<typeof v19RequestSchema>;
export type V19Response = z.infer<typeof v19ResponseSchema>;
