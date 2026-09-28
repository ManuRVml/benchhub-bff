import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { snapshotIdSchema } from '../common/ids.js';
import { sectionResult } from '../common/section-result.js';

import { valueMonitorKpisSchema } from './shared.js';

// V-27 — Value monitor: GET /api/v1/views/value-monitor (docs/requirements/view-data-contracts/V-27-value-monitor.md).
// SCR-11 header card, KPI tiles and Ecopetrol's dimension weights. Every Monitor widget is snapshot-scoped; closed
// snapshots are read-only.

export const valueMonitorStatusSchema = z.enum(['in_construction', 'in_review', 'published']);

export const v27HeaderSchema = z
  .object({
    analystName: z.string(),
    updatedLabel: z.string(),
    status: valueMonitorStatusSchema,
    selectedSnapshotId: snapshotIdSchema,
    snapshots: z.array(
      z
        .object({
          id: snapshotIdSchema,
          label: z.string(),
          note: z.string(),
          isClosed: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

/** Ecopetrol's declared weight per dimension, percentage points (45 / 30 / 25). */
export const v27DimensionWeightsSchema = z
  .object({
    fin: z.number().min(0).max(100),
    op: z.number().min(0).max(100),
    trans: z.number().min(0).max(100),
  })
  .strict();

export const v27ResponseSchema = z
  .object({
    /** CF-126: the bare primary datum; its failure fails the view with the endpoint ApiError. */
    header: v27HeaderSchema,
    kpis: sectionResult(valueMonitorKpisSchema),
    dimensionWeights: sectionResult(v27DimensionWeightsSchema),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V27Response = z.infer<typeof v27ResponseSchema>;

/**
 * `kpis` and `dimensionWeights` stay SectionResults (the example wraps them; the tiles fail independently), although the
 * prose now reads "Sections: none" (listed as a divergence).
 */
export const V27_SECTIONS = ['kpis', 'dimensionWeights'] as const;

/** Query: `snapshot` (URL `corte`); absent = the latest snapshot, resolved by the BFF. */
export const valueMonitorSnapshotQuerySchema = z
  .object({ snapshot: snapshotIdSchema.optional() })
  .strict();

export const v27QuerySchema = valueMonitorSnapshotQuerySchema;

export type V27Query = z.infer<typeof v27QuerySchema>;
