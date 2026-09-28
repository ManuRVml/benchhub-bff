import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { companyIdSchema } from '../common/ids.js';
import { dimensionSchema } from '../results/results-shared.js';

import { dimensionQuerySchema } from './visualization-shared.js';

// V-21 — Peer weight ranking: GET /api/v1/views/peer-weight-ranking/:analysisId (SCR-09 "Ranking por categoría").
// Bare payload; a failure is the endpoint ApiError (CF-128).

/** Query of the GET: the ranked dimension (URL `ranking`). */
export const v21RequestSchema = dimensionQuerySchema;

const pct = z.number().min(0).max(100);

/**
 * Explanation row text (i18n key + params), one per rule of HTML L4690–4692: the leader, Ecopetrol (adds the gap to
 * the sector average) and every other peer (position and gap to the leader).
 */
export const v21ExplanationSchema = z.discriminatedUnion('key', [
  z
    .object({
      key: z.literal('ranking.explain.leader'),
      params: z.object({ name: z.string(), dimension: dimensionSchema, pct }).strict(),
    })
    .strict(),
  z
    .object({
      key: z.literal('ranking.explain.ecopetrol'),
      params: z
        .object({
          rank: z.number().int().min(1),
          dimension: dimensionSchema,
          pct,
          gapToLeaderPts: z.number(),
          leaderName: z.string(),
          leaderPct: pct,
          gapToAvgPts: z.number(),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      key: z.literal('ranking.explain.peer'),
      params: z
        .object({
          name: z.string(),
          rank: z.number().int().min(1),
          dimension: dimensionSchema,
          pct,
          gapToLeaderPts: z.number(),
          leaderName: z.string(),
          leaderPct: pct,
        })
        .strict(),
    })
    .strict(),
]);

export const v21RowSchema = z
  .object({
    rank: z.number().int().min(1),
    companyId: companyIdSchema,
    name: z.string(),
    initials: z.string(),
    colorKey: z.string(),
    pct,
    isLeader: z.boolean(),
    isEcopetrol: z.boolean(),
    explanation: v21ExplanationSchema,
  })
  .strict();

export const v21ResponseSchema = z
  .object({
    dimension: dimensionSchema,
    rows: z.array(v21RowSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V21Request = z.infer<typeof v21RequestSchema>;
export type V21Response = z.infer<typeof v21ResponseSchema>;
