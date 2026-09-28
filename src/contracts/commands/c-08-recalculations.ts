import { z } from 'zod';

import { analysisIdSchema, changeRequestIdSchema, operationIdSchema } from '../common/ids.js';

// C-08 — Recalculate analysis or monitor: POST /api/v1/recalculations
// (web@d4c7ea2 docs/design/view-data-contracts/C-08-recalculations.md). Long-running: 202 + operationId (F22).

export const recalculationReasonSchema = z.enum([
  'user-edited-values',
  'external-data-update',
  'manual-trigger',
]);

export const c08RequestSchema = z
  .object({
    analysisId: analysisIdSchema.optional(),
    /** Recalculate the value monitor instead of one analysis; used when `analysisId` is absent. */
    monitor: z.boolean().optional(),
    reason: recalculationReasonSchema,
    changeRequestId: changeRequestIdSchema.optional(),
  })
  .strict()
  .refine((request) => request.analysisId !== undefined || request.monitor === true, {
    message: 'MISSING_CONTEXT: either analysisId or monitor is required',
  });

export const c08ResponseSchema = z
  .object({
    operationId: operationIdSchema,
    status: z.enum(['accepted']),
  })
  .strict();

export type C08Request = z.infer<typeof c08RequestSchema>;
export type C08Response = z.infer<typeof c08ResponseSchema>;
