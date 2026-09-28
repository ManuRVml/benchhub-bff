import { z } from 'zod';

import { indicatorIdSchema, simulationIdSchema } from '../common/ids.js';

import { leverValueSchema } from './c-21-evaluate-sensitivity.js';

// C-23 — Save sensitivity simulation: POST /api/v1/sensitivity-simulations
// (docs/requirements/view-data-contracts/C-23-save-sensitivity-simulation.md). F27/F28; saves the simulation next to the
// analysis and never overwrites real values.

// The example shows `scenarios: []` without a shape; a scenario is modelled as a named set of lever values plus the
// simulated result of C-21 (listed as a divergence).
export const sensitivityScenarioSchema = z
  .object({
    name: z.string().min(1),
    levers: z.array(leverValueSchema),
    simulatedValue: z.number(),
  })
  .strict();

export const c23RequestSchema = z
  .object({
    simulationData: z
      .object({
        indicatorId: indicatorIdSchema,
        scenarios: z.array(sensitivityScenarioSchema),
      })
      .strict(),
  })
  .strict();

export const c23ResponseSchema = z
  .object({
    saved: z.boolean(),
    simulationId: simulationIdSchema,
  })
  .strict();

export type C23Request = z.infer<typeof c23RequestSchema>;
export type C23Response = z.infer<typeof c23ResponseSchema>;
