import { z } from 'zod';

import { fileIdSchema, operationIdSchema } from '../common/ids.js';

// O-01 — Operation status: GET /api/v1/operations/:operationId
// (docs/requirements/view-data-contracts/O-01-operation-status.md). Polling fallback for the 202 commands C-03, C-08,
// C-14, C-17; the id is the BFF's own operationId, never a Databricks job/run id (brief §4.1 rule 10).

/** CF-117: the job kinds behind the 202 commands (English snake_case, CF-101). */
export const operationKindSchema = z.enum([
  'analysis_generation',
  'recalculation',
  'export',
  'configuration_apply',
]);

export const operationStatusSchema = z.enum(['queued', 'running', 'succeeded', 'failed']);

/** On success: where to go (generation / recalculation) or the produced file (exports, downloaded with O-03). */
export const operationResultSchema = z.union([
  z.object({ targetRoute: z.string().startsWith('/') }).strict(),
  z.object({ fileId: fileIdSchema, fileName: z.string().min(1) }).strict(),
]);

export const operationErrorSchema = z
  .object({ code: z.string().min(1), messageKey: z.string().min(1) })
  .strict();

export const o01ResponseSchema = z
  .object({
    id: operationIdSchema,
    kind: operationKindSchema,
    status: operationStatusSchema,
    progressPct: z.number().int().min(0).max(100),
    messageKey: z.string().min(1),
    result: operationResultSchema.nullable(),
    error: operationErrorSchema.nullable(),
  })
  .strict();

export type O01Response = z.infer<typeof o01ResponseSchema>;
