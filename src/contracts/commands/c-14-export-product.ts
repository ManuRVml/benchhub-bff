import { z } from 'zod';

import { analysisIdSchema, operationIdSchema, presentationIdSchema } from '../common/ids.js';

// C-14 — Export analysis product: POST /api/v1/exports (docs/requirements/view-data-contracts/C-14-export-product.md).
// Long-running: answers 202 with the BFF's own operationId (O-01/O-02 track it, O-03 downloads the file).

export const exportKindSchema = z.enum([
  'report-summary-xlsx',
  'value-monitor-pdf',
  'presentation-pptx',
  'presentation-pdf',
  'strategic-plan',
  'radar-png',
]);

export const c14RequestSchema = z
  .object({
    kind: exportKindSchema,
    params: z
      .object({
        // Optional: `radar-png` and `strategic-plan` (Monitor de Valor, SCR-11) have no analysis context; every other
        // kind still requires it (the BFF handler enforces this per-kind, not this schema).
        analysisId: analysisIdSchema.optional(),
        // Carried by `presentation-pptx` / `presentation-pdf` (SCR-14): the presentation to export. The BFF handler
        // requires it for those kinds and ignores it for the others.
        presentationId: presentationIdSchema.optional(),
        // Format-specific option; optional in the example.
        format: z.string().min(1).optional(),
      })
      .strict(),
  })
  .strict();

export const c14ResponseSchema = z
  .object({
    operationId: operationIdSchema,
    status: z.enum(['accepted']),
  })
  .strict();

export type C14Request = z.infer<typeof c14RequestSchema>;
export type C14Response = z.infer<typeof c14ResponseSchema>;
