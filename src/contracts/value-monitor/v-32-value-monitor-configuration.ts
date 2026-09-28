import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { kviIdSchema } from '../common/ids.js';

// V-32 — Value monitor configuration: GET /api/v1/views/value-monitor-configuration (SCR-11 section 7, CF-19).
// No params: the configuration belongs to the monitor, not to a snapshot. The prose calls the card one SectionResult;
// the example is the bare payload (the example wins for shape).

/** Data sources of the monitor ("Fuentes (sin periodicidad fija)" chips). */
export const valueMonitorSourceIdSchema = z.enum([
  'capital_iq',
  'bloomberg',
  'platts',
  'interna_ecp',
]);

const year = z.number().int().min(1000).max(9999);

export const v32ResponseSchema = z
  .object({
    cutOffDate: z.iso.date(),
    /** "Rango desde" / "Rango hasta": 4-digit years, desde ≤ hasta (validated by C-17). */
    rangeFrom: year,
    rangeTo: year,
    /** Saved via C-17; V-32 was missing the read-back, so a returning user always saw fixed defaults. */
    thresholds: z
      .object({
        alert: z.number().min(0).max(100),
        warning: z.number().min(0).max(100),
      })
      .strict(),
    period: z.enum(['quarter', 'year']),
    sources: z.array(
      z
        .object({ id: valueMonitorSourceIdSchema, label: z.string(), isEnabled: z.boolean() })
        .strict(),
    ),
    /** KVI inclusion chips, in KVI table order. */
    kvis: z.array(
      z.object({ id: kviIdSchema, label: z.string(), isIncluded: z.boolean() }).strict(),
    ),
    exceptionsText: z.string(),
    assistantContext: z.string(),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V32Response = z.infer<typeof v32ResponseSchema>;
