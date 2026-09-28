import { z } from 'zod';

import { kviIdSchema } from '../common/ids.js';
import {
  kviRowSchema,
  valueMonitorCompositionSchema,
  valueMonitorKpisSchema,
} from '../value-monitor/shared.js';

// C-16 — Update KVI targets: PATCH /api/v1/kvis/:kviId/targets
// (docs/requirements/view-data-contracts/C-16-update-kvi-targets.md). F24: edits Meta / Meta Reto; the BFF recomputes
// the row and the aggregates and returns them so the web can replace its V-30 row, V-27 kpis and V-31 caches (CF-103).

export const c16RequestSchema = z
  .object({
    meta: z.number(),
    // null clears the Meta Reto (the KVI then has no challenge target).
    metaReto: z.number().nullable().optional(),
  })
  .strict();

export const c16ResponseSchema = z
  .object({
    kviId: kviIdSchema,
    targets: z
      .object({
        meta: z.number(),
        metaReto: z.number().nullable(),
      })
      .strict(),
    row: kviRowSchema,
    kpis: valueMonitorKpisSchema,
    composition: valueMonitorCompositionSchema,
  })
  .strict();

export type C16Request = z.infer<typeof c16RequestSchema>;
export type C16Response = z.infer<typeof c16ResponseSchema>;
