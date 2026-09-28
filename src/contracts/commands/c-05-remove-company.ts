import { z } from 'zod';

// C-05 — Remove company from analysis: DELETE /api/v1/analyses/:analysisId/companies/:companyId
// (web@d4c7ea2 docs/design/view-data-contracts/C-05-remove-company.md). Also used by "Deshacer" (undo).

/** Empty body: analysis and company are path params. */
export const c05RequestSchema = z.object({}).strict();

export const c05ResponseSchema = z
  .object({
    removed: z.boolean(),
    /** Companies in the peer set after the change. */
    companyCount: z.number().int().min(0),
  })
  .strict();

export type C05Request = z.infer<typeof c05RequestSchema>;
export type C05Response = z.infer<typeof c05ResponseSchema>;
