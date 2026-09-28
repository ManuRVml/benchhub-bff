import { z } from 'zod';

import { indicatorIdSchema, operationIdSchema } from '../common/ids.js';

// C-17 — Update value monitor configuration: PUT /api/v1/value-monitor-configuration
// (docs/requirements/view-data-contracts/C-17-update-value-monitor-config.md). F25; may start an F22 recalculation.

export const c17RequestSchema = z
  .object({
    config: z
      .object({
        visibleIndicators: z.array(indicatorIdSchema),
        thresholds: z
          .object({
            alert: z.number().min(0).max(100),
            warning: z.number().min(0).max(100),
          })
          .strict(),
        period: z.enum(['quarter', 'year']),
      })
      .strict(),
  })
  .strict();

export const c17ResponseSchema = z
  .object({
    saved: z.boolean(),
    // Present only when the change triggered a recalculation.
    recalculationOperationId: operationIdSchema.optional(),
  })
  .strict();

export type C17Request = z.infer<typeof c17RequestSchema>;
export type C17Response = z.infer<typeof c17ResponseSchema>;
