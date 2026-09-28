import { z } from 'zod';

import { analysisIdSchema, draftIdSchema } from '../common/ids.js';

// C-01 — Create analysis draft: POST /api/v1/analysis-drafts
// (web@d4c7ea2 docs/design/view-data-contracts/C-01-create-analysis-draft.md). Role `analyst_creator`.

/** The three analysis types of SCR-06 "+ Crear nuevo análisis" (INVALID_TYPE otherwise). */
export const analysisTypeSchema = z.enum([
  'desempeno_comparativo',
  'referentes_estrategicos',
  'generacion_valor',
]);

export const c01RequestSchema = z
  .object({
    type: analysisTypeSchema,
    /** Copy the configuration of this analysis (ANALYSIS_NOT_FOUND when it does not exist). */
    fromAnalysisId: analysisIdSchema.optional(),
  })
  .strict();

export const c01ResponseSchema = z.object({ draftId: draftIdSchema }).strict();

export type C01Request = z.infer<typeof c01RequestSchema>;
export type C01Response = z.infer<typeof c01ResponseSchema>;
