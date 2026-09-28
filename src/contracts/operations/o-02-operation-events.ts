import { z } from 'zod';

import { operationIdSchema } from '../common/ids.js';

import {
  operationErrorSchema,
  operationResultSchema,
  operationStatusSchema,
} from './o-01-operation-status.js';

// O-02 — Operation events: GET /api/v1/operations/:operationId/events
// (docs/requirements/view-data-contracts/O-02-operation-events.md). text/event-stream with typed events `progress`,
// `succeeded`, `failed`; this schema is the `data:` payload. `succeeded` carries `result`, `failed` carries `error`
// (same shapes as O-01); a `progress` event carries neither.

export const o02ResponseSchema = z
  .object({
    operationId: operationIdSchema,
    status: operationStatusSchema,
    progressPct: z.number().int().min(0).max(100),
    messageKey: z.string().min(1),
    result: operationResultSchema.optional(),
    error: operationErrorSchema.optional(),
  })
  .strict();

export type O02Response = z.infer<typeof o02ResponseSchema>;
