import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { dimensionSchema } from '../results/results-shared.js';

// V-23 — Weight recommendations: GET /api/v1/views/weight-recommendations/:analysisId (OVL-01 and its pill count).
// Bare payload; a failure is the endpoint ApiError (CF-128). The two scopes carry different items, so the response is a
// union on `scope`.

/** Query of the GET: the trigger's fixed scope; `horizon` only matters for `scope=horizon` (SCR-08 URL `horizonte`). */
export const v23RequestSchema = z
  .object({
    scope: z.enum(['visualization', 'horizon']).default('visualization'),
    horizon: z.enum(['tbg', 'ilp']).default('tbg'),
  })
  .strict();

const pct = z.number().min(0).max(100);

/**
 * `scope=visualization`: one rule-based card per dimension (HTML L4703–4705): `|diff| < 6` → ok, `diff > 0` → watch,
 * `diff < 0` → action (which adds the leader name and weight).
 */
export const v23VisualizationItemSchema = z
  .object({
    dimension: dimensionSchema,
    tone: z.enum(['ok', 'watch', 'action']),
    text: z
      .object({
        key: z.enum(['reco.weights.ok', 'reco.weights.watch', 'reco.weights.action']),
        params: z
          .object({
            dimension: dimensionSchema,
            ecopetrolPct: pct,
            peerAvgPct: pct,
            leaderName: z.string().optional(),
            leaderPct: pct.optional(),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

const horizonTone = z.enum(['info', 'watch', 'action']);

/** One `scope=horizon` card: its kind fixes the i18n key and the params (CF-130). */
function horizonItem<Kind extends string, Key extends string, Params extends z.ZodRawShape>(
  kind: Kind,
  key: Key,
  params: Params,
) {
  return z
    .object({
      kind: z.literal(kind),
      tone: horizonTone,
      text: z.object({ key: z.literal(key), params: z.object(params).strict() }).strict(),
    })
    .strict();
}

/**
 * `scope=horizon`: the three module-7 cards (HTML L4482–4486), CF-130: "Indicador más concentrado", "Consistencia de
 * datos" and the dominant dimension, each with its own key and params (`dimension` is the display name).
 */
export const v23HorizonItemSchema = z.discriminatedUnion('kind', [
  horizonItem('most_concentrated', 'reco.horizon.mostConcentrated', {
    company: z.string(),
    indicator: z.string(),
    pct,
  }),
  horizonItem('data_consistency', 'reco.horizon.dataConsistency', {
    company: z.string(),
    companyTotal: pct,
  }),
  horizonItem('dominant_dimension', 'reco.horizon.dominantDimension', {
    dimension: z.string(),
    finPct: pct,
    opPct: pct,
    transPct: pct,
  }),
]);

const common = {
  countActionable: z.number().int().min(0),
  /** Rule-based AI suggestion (CF-40); no other state is defined for v1. */
  status: z.enum(['suggestion']),
  permissions: ActionPermissionsSchema,
};

export const v23ResponseSchema = z.discriminatedUnion('scope', [
  z
    .object({
      scope: z.literal('visualization'),
      items: z.array(v23VisualizationItemSchema),
      ...common,
    })
    .strict(),
  z
    .object({
      scope: z.literal('horizon'),
      /** Exactly the three cards (CF-130). */
      items: z.array(v23HorizonItemSchema).length(3),
      ...common,
    })
    .strict(),
]);

export type V23Request = z.infer<typeof v23RequestSchema>;
export type V23Response = z.infer<typeof v23ResponseSchema>;
