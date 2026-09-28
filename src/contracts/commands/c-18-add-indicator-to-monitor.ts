import { z } from 'zod';

import { indicatorIdSchema } from '../common/ids.js';

// C-18 — Add indicator to value monitor: POST /api/v1/value-monitor-kvis
// (docs/requirements/view-data-contracts/C-18-add-indicator-to-monitor.md). F25 ("Añadir al monitor").

export const c18RequestSchema = z
  .object({
    source: z.enum(['categories', 'all', 'custom']),
    indicatorIds: z.array(indicatorIdSchema).min(1),
  })
  .strict();

export const c18ResponseSchema = z
  .object({
    added: z.boolean(),
    monitorCount: z.number().int().min(0),
  })
  .strict();

export type C18Request = z.infer<typeof c18RequestSchema>;
export type C18Response = z.infer<typeof c18ResponseSchema>;
