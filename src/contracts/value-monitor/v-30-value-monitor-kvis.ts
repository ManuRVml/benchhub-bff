import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { snapshotIdSchema } from '../common/ids.js';
import { commaListSchema } from '../common/query.js';

import { kviBandSchema, kviCategoryIdSchema, kviRowSchema } from './shared.js';

// V-30 — Value monitor KVIs: GET /api/v1/views/value-monitor-kvis
// (docs/requirements/view-data-contracts/V-30-value-monitor-kvis.md). SCR-11 KVI table: warnings + 22 rows travel
// together (single-module view, CF-97). The row shape is shared with the C-16 response (CF-103).

export const v30ResponseSchema = z
  .object({
    warnings: z.array(z.object({ code: z.string().min(1), text: z.string() }).strict()),
    rows: z.array(kviRowSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V30Response = z.infer<typeof v30ResponseSchema>;

/**
 * Query: `snapshot` (URL `corte`, absent = latest), `categories` (URL `categoria`) and `compliance` (URL `cumplimiento`,
 * applied to `resultBand`). Lists are comma-separated; empty = all. ANDed across groups, ORed within a group.
 */
export const v30QuerySchema = z
  .object({
    snapshot: snapshotIdSchema.optional(),
    categories: commaListSchema(kviCategoryIdSchema),
    compliance: commaListSchema(kviBandSchema),
  })
  .strict();

export type V30Query = z.infer<typeof v30QuerySchema>;
