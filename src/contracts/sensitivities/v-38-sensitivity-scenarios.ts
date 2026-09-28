import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { UnitCodeSchema } from '../common/units.js';

// V-38 — Sensitivity scenarios: GET /api/v1/views/sensitivity-scenarios
// (docs/requirements/view-data-contracts/V-38-sensitivity-scenarios.md). SCR-12 §3–5: simulation variables and the
// ROACE base / peer average; simulated ROACE, gapClosedPct and the above-peers status come from C-24.
// Bare payload per module; a failure is the endpoint ApiError (CF-123).

/** CF-125: the two simulation variables, the same keys as C-24's categories. */
export const sensitivityVariableIdSchema = z.enum(['productivity', 'operating_costs']);

export const v38VariableSchema = z
  .object({
    id: sensitivityVariableIdSchema,
    label: z.string(),
    unit: UnitCodeSchema,
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    default: z.number(),
  })
  .strict();

export const v38PresetSchema = z
  .object({
    id: z.enum(['base', 'optimistic', 'conservative']),
    label: z.string(),
    values: z
      .object({
        productivity: z.number(),
        operating_costs: z.number(),
      })
      .strict(),
  })
  .strict();

export const v38ResponseSchema = z
  .object({
    variables: z.array(v38VariableSchema),
    /** Ecopetrol ROACE in percent (7,4 %). */
    baseRoace: z.number(),
    /** Peer average ROACE in percent (5,5 %). */
    peerAvgRoace: z.number(),
    /**
     * CF-124: preset scenarios, each a value per variable. Optional: SCR-12 renders no preset cards in v1 (CF-10).
     */
    presets: z.array(v38PresetSchema).optional(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V38Response = z.infer<typeof v38ResponseSchema>;
