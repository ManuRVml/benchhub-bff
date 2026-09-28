import { z } from 'zod';

import { generatedBySchema } from '../common/generated-by.js';
import { analysisIdSchema } from '../common/ids.js';

// C-15 — Generate executive narrative: POST /api/v1/executive-narratives
// (docs/requirements/view-data-contracts/C-15-generate-executive-narrative.md). F18; the output is an AI suggestion
// generated from templates or an LLM.

// CF-102: analysisId is required for `results` and omitted for `value-monitor` (the Monitor has no analysis).
export const c15RequestSchema = z
  .object({
    scope: z.enum(['results', 'value-monitor']),
    section: z.enum(['overview', 'performance', 'trends', 'recommendations']),
    analysisId: analysisIdSchema.optional(),
  })
  .strict()
  .superRefine((request, ctx) => {
    if (request.scope === 'results' && request.analysisId === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['analysisId'],
        message: 'analysisId is required when scope is results',
      });
    }
    if (request.scope === 'value-monitor' && request.analysisId !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['analysisId'],
        message: 'analysisId is omitted when scope is value-monitor',
      });
    }
  });

export const c15NarrativeSectionSchema = z
  .object({
    title: z.string(),
    text: z.string(),
  })
  .strict();

export const c15ResponseSchema = z
  .object({
    sections: z.array(c15NarrativeSectionSchema),
    status: z.enum(['suggestion']),
    /** CF-110: `{ model, version }` (the prose still says "template or llm"; the example and CF-110 win). */
    generatedBy: generatedBySchema,
  })
  .strict();

export type C15Request = z.infer<typeof c15RequestSchema>;
export type C15Response = z.infer<typeof c15ResponseSchema>;
