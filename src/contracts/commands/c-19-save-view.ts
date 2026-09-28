import { z } from 'zod';

import { savedViewIdSchema } from '../common/ids.js';
import { shellScreenSchema } from '../common/screens.js';

// C-19 — Save view: POST /api/v1/saved-views (docs/requirements/view-data-contracts/C-19-save-view.md). F36: stores the
// user's view state of a screen so it can be reopened (V-47).

/** The screen whose view state is saved: the 12 in-shell screens (same list as C-33, CF-112). */
export const savedViewScreenSchema = shellScreenSchema;

// The example only shows empty containers; the state is the screen's URL-persisted view state, so filter values are
// strings or string lists, columns are column ids and sort is one key + direction (listed as a divergence).
export const savedViewStateSchema = z
  .object({
    filters: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    columns: z.array(z.string().min(1)),
    sort: z
      .object({
        key: z.string().min(1),
        direction: z.enum(['asc', 'desc']),
      })
      .strict(),
  })
  .strict();

export const c19RequestSchema = z
  .object({
    screen: savedViewScreenSchema,
    state: savedViewStateSchema,
  })
  .strict();

export const c19ResponseSchema = z
  .object({
    id: savedViewIdSchema,
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export type C19Request = z.infer<typeof c19RequestSchema>;
export type C19Response = z.infer<typeof c19ResponseSchema>;
