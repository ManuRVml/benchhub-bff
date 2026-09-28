import { z } from 'zod';

import { kviIdSchema } from '../common/ids.js';

// C-24 — Evaluate weight simulation: POST /api/v1/weight-simulation-evaluations
// (docs/requirements/view-data-contracts/C-24-evaluate-weight-simulation.md). F28; stateless.
// Two independent modes, discriminated by `mode`: `weights` (§6 KVI weight sliders -> score/variation) and
// `scenario` (SCR-12 §3-4 productivity/operating-costs sliders -> simulated ROACE vs. peers). V-38 models the
// scenario sliders' metadata (ranges, base/peer ROACE, presets); this command only evaluates a drag.

const weightsRequestSchema = z
  .object({
    mode: z.literal('weights'),
    weights: z.array(
      z
        .object({
          // CF-106: the simulator weights KVIs (V-39).
          kviId: kviIdSchema,
          // CF-99: percentage points 0..100 (the prose still says 0..1; CF-99 and the example win).
          weight: z.number().min(0).max(100),
        })
        .strict(),
    ),
  })
  .strict();

// SCR-12 §3 slider ranges (step 1, native default).
const scenarioRequestSchema = z
  .object({
    mode: z.literal('scenario'),
    productivity: z.number().min(-5).max(10),
    operatingCosts: z.number().min(-15).max(10),
  })
  .strict();

export const c24RequestSchema = z.discriminatedUnion('mode', [
  weightsRequestSchema,
  scenarioRequestSchema,
]);

const beforeAfterSchema = z
  .object({
    before: z.number(),
    after: z.number(),
  })
  .strict();

const weightsResponseSchema = z
  .object({
    mode: z.literal('weights'),
    score: z.number(),
    variation: z.number(),
    categories: z
      .object({
        productivity: beforeAfterSchema,
        // CF-125: the two simulator categories are `productivity` / `operating_costs` everywhere.
        operating_costs: beforeAfterSchema,
      })
      .strict(),
    status: z.enum(['calculated']),
  })
  .strict();

const scenarioResponseSchema = z
  .object({
    mode: z.literal('scenario'),
    baseRoace: z.number(),
    simulatedRoace: z.number(),
    peerAvgRoace: z.number(),
    // "Brecha cerrada vs. pares" (%). Not meaningful once the base ROACE is already above the peer average
    // (CF-68/A2): `above_peers` tells the UI to hide the gap bar/tooltip instead of showing a bogus 0%.
    gapClosedPct: z.number(),
    status: z.enum(['calculated', 'above_peers']),
  })
  .strict();

export const c24ResponseSchema = z.discriminatedUnion('mode', [
  weightsResponseSchema,
  scenarioResponseSchema,
]);

export type C24Request = z.infer<typeof c24RequestSchema>;
export type C24Response = z.infer<typeof c24ResponseSchema>;
