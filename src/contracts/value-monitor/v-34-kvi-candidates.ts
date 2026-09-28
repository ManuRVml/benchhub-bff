import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { indicatorIdSchema } from '../common/ids.js';

// V-34 — KVI candidates: GET /api/v1/views/kvi-candidates (OVL-05 "Añadir indicador"). The prose calls each tab load
// one SectionResult; the example is the bare payload (the example wins for shape).

/** Candidate catalogue tab: "Referenciamiento de pares" / "TBG" / "ILP". */
export const kviCandidateSourceSchema = z.enum(['pares', 'tbg', 'ilp']);

/** Query: the active tab. */
export const v34RequestSchema = z
  .object({ source: kviCandidateSourceSchema.default('pares') })
  .strict();

export const v34ResponseSchema = z
  .object({
    source: kviCandidateSourceSchema,
    items: z.array(
      z
        .object({
          indicatorId: indicatorIdSchema,
          label: z.string(),
          categoryLabel: z.string(),
          /** Already a KVI of the monitor: the UI disables it (SCR-11 A10). */
          isAlreadyIncluded: z.boolean(),
        })
        .strict(),
    ),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V34Request = z.infer<typeof v34RequestSchema>;
export type V34Response = z.infer<typeof v34ResponseSchema>;
