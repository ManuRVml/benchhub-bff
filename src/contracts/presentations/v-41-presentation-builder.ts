import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';

import {
  presentationLanguageSchema,
  presentationTemplateIdSchema,
  templateAccentKeySchema,
} from './presentations-shared.js';

// V-41 — Presentation builder: GET /api/v1/views/presentation-builder/:presentationId
// (docs/requirements/view-data-contracts/V-41-presentation-builder.md). SCR-13 builder "Nueva presentación"; slide
// previews come from V-42. The prose calls the builder card one SectionResult; the example is the bare payload.

/** The 7-module registry of the builder (HTML L4859–4867). */
export const presentationModuleIdSchema = z.enum([
  'hom',
  'comp',
  'pvc',
  'resumen',
  'panorama',
  'peso',
  'hallazgos',
]);

/** Slide / note key `moduleId|chartId` (e.g. `comp|barras`). */
export const slideNoteKeySchema = z.string().regex(/^[^|]+\|[^|]+$/);

export const v41ChartSchema = z
  .object({
    id: z.string().min(1),
    label: z.string(),
    isSelected: z.boolean(),
  })
  .strict();

export const v41ModuleSchema = z
  .object({
    id: presentationModuleIdSchema,
    label: z.string(),
    charts: z.array(v41ChartSchema),
  })
  .strict();

export const v41ResponseSchema = z
  .object({
    meta: z
      .object({
        title: z.string(),
        date: z.iso.date().nullable(),
        language: presentationLanguageSchema,
        // null renders as Directorio.
        templateId: presentationTemplateIdSchema.nullable(),
      })
      .strict(),
    templates: z.array(
      z
        .object({
          id: presentationTemplateIdSchema,
          name: z.string(),
          description: z.string(),
          accentKey: templateAccentKeySchema,
        })
        .strict(),
    ),
    includeCover: z.boolean(),
    includeClosing: z.boolean(),
    modules: z.array(v41ModuleSchema),
    // Selected charts + cover + closing (default 7; "Seleccionar todo" → 24).
    slideCount: z.number().int().min(0),
    // Analyst notes keyed `moduleId|chartId`.
    notes: z.record(slideNoteKeySchema, z.string()),
    // Chart slides without a note ("✦ Redactar comentarios con Yarbis (n)").
    pendingNoteCount: z.number().int().min(0),
    uploadedVersion: z
      .object({
        fileName: z.string().regex(/\.[pP][pP][tT][xX]?$/),
        // Formatted by the BFF, e.g. "2,4 MB".
        sizeLabel: z.string(),
        uploadedAt: z.iso.datetime({ offset: true }),
      })
      .strict()
      .nullable(),
    commentCount: z.number().int().min(0),
    // canEdit, canPublish, canUpload, canDraftWithAssistant.
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V41Response = z.infer<typeof v41ResponseSchema>;
