import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { categoryIdSchema, kviIdSchema } from '../common/ids.js';

// V-39 — Weight simulator: GET /api/v1/views/weight-simulator
// (docs/requirements/view-data-contracts/V-39-weight-simulator.md). SCR-12 §6–7: score strip, category groups with KVI
// weights and the Yarbis recommendations; the simulated score and category status come from C-24.
// Bare payload per module; a failure is the endpoint ApiError (CF-123).

/** Monitor result band of a KVI: ≥ 90 `ok`, ≥ 70 `watch`, else `critical`. */
export const v39BandSchema = z.enum(['ok', 'watch', 'critical']);

export const v39KviSchema = z
  .object({
    kviId: kviIdSchema,
    label: z.string(),
    /** Default weight in percentage points (sliders 0–30). */
    weightPct: z.number().min(0).max(100),
    /** The KVI's Resultado Monitor in percent; can exceed 100. */
    monitorPct: z.number(),
    band: v39BandSchema,
  })
  .strict();

export const v39CategorySchema = z
  .object({
    id: categoryIdSchema,
    label: z.string(),
    /** Category target weight in percentage points (60 / 15 / 20 / 5). */
    targetPct: z.number().min(0).max(100),
    kvis: z.array(v39KviSchema),
  })
  .strict();

export const v39RecommendationSchema = z
  .object({
    kviId: kviIdSchema,
    label: z.string(),
    /** Gap to the target in points; the list is ordered by gap × weight. */
    gapPts: z.number(),
    weightPct: z.number().min(0).max(100),
    tone: z.enum(['watch', 'action']),
  })
  .strict();

export const v39ResponseSchema = z
  .object({
    /** Weighted score vs target in percent (91,8 % in V2). */
    baseScore: z.number(),
    categories: z.array(v39CategorySchema),
    recommendations: z.array(v39RecommendationSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V39Response = z.infer<typeof v39ResponseSchema>;
