import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { generatedBySchema } from '../common/generated-by.js';

import { horizonSchema } from './results-shared.js';

// V-14 — AI findings: GET /api/v1/views/ai-findings/:analysisId (Resultados right rail "Hallazgos de IA").
// AI suggestion (CF-40 / OQ-19): at most 5 findings, always `status: 'suggestion'`, read-only (empty permissions).

export const v14ResponseSchema = z
  .object({
    findings: z.array(z.object({ id: z.string().min(1), text: z.string() }).strict()).max(5),
    status: z.literal('suggestion'),
    // Provenance of the generator (CF-110); never infrastructure ids.
    generatedBy: generatedBySchema,
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V14Response = z.infer<typeof v14ResponseSchema>;

// Query: `horizon` (URL `horizonte`).
export const v14QuerySchema = z.object({ horizon: horizonSchema.default('tbg') }).strict();

export type V14Query = z.infer<typeof v14QuerySchema>;
