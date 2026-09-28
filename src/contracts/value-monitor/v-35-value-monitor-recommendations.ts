import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { generatedBySchema } from '../common/generated-by.js';
import { dimensionSchema } from '../results/results-shared.js';

import { valueMonitorSnapshotQuerySchema } from './v-27-value-monitor.js';

// V-35 — Value monitor recommendations: GET /api/v1/views/value-monitor-recommendations (OVL-02). Rule-based
// suggestions rendered in es-CO by the BFF (OQ-19). The prose calls the view one SectionResult; the example is the bare
// payload (the example wins for shape).

/** Query: `snapshot` (URL `corte`); absent = the latest snapshot. */
export const v35RequestSchema = valueMonitorSnapshotQuerySchema;

export const v35ResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          dimension: dimensionSchema,
          label: z.string(),
          /** `ok` when |Δ| < 6 pts, `watch` above the sector, `action` below (same rule as V-23). */
          tone: z.enum(['ok', 'watch', 'action']),
          text: z.string(),
        })
        .strict(),
    ),
    /** AI suggestion (CF-40); no other state is defined for v1. */
    status: z.enum(['suggestion']),
    generatedBy: generatedBySchema,
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V35Request = z.infer<typeof v35RequestSchema>;
export type V35Response = z.infer<typeof v35ResponseSchema>;
