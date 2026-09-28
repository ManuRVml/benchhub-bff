import { z } from 'zod';

import { companyIdSchema } from '../common/ids.js';

// C-04 — Add company to analysis: POST /api/v1/analyses/:analysisId/companies
// (web@d4c7ea2 docs/design/view-data-contracts/C-04-add-company.md).

export const c04RequestSchema = z.object({ companyId: companyIdSchema }).strict();

export const c04ResponseSchema = z
  .object({
    added: z.boolean(),
    /** Companies in the peer set after the change. */
    companyCount: z.number().int().min(0),
  })
  .strict();

export type C04Request = z.infer<typeof c04RequestSchema>;
export type C04Response = z.infer<typeof c04ResponseSchema>;
