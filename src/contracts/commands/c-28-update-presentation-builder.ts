import { z } from 'zod';

import {
  presentationModuleIdSchema,
  v41ChartSchema,
  v41ResponseSchema,
} from '../presentations/v-41-presentation-builder.js';

// C-28 — Update presentation builder: PATCH /api/v1/presentations/:presentationId
// (docs/requirements/view-data-contracts/C-28-update-presentation-builder.md). F29/F30; builder autosave.

/**
 * The editable builder state of V-41 (CF-109): meta, per-module chart selection, cover / closing flags and notes.
 * Catalogue data (module and chart labels, templates, counts, uploaded version) stays in V-41 only.
 */
export const presentationBuilderStateSchema = z
  .object({
    meta: v41ResponseSchema.shape.meta,
    modules: z.array(
      z
        .object({
          id: presentationModuleIdSchema,
          charts: z.array(v41ChartSchema.pick({ id: true, isSelected: true }).strict()),
        })
        .strict(),
    ),
    includeCover: v41ResponseSchema.shape.includeCover,
    includeClosing: v41ResponseSchema.shape.includeClosing,
    notes: v41ResponseSchema.shape.notes,
  })
  .strict();

/** PATCH autosave: a partial builder state, every top-level key optional; the BFF merges only the keys sent. */
export const c28RequestSchema = presentationBuilderStateSchema.partial().strict();

/**
 * The merged builder state after the patch. CF-109 says "the full V-41", but the contract example is the builder state
 * only (no labels, templates or counts); the example wins on presence (listed as a divergence).
 */
export const c28ResponseSchema = presentationBuilderStateSchema;

export type PresentationBuilderState = z.infer<typeof presentationBuilderStateSchema>;
export type C28Request = z.infer<typeof c28RequestSchema>;
export type C28Response = z.infer<typeof c28ResponseSchema>;
