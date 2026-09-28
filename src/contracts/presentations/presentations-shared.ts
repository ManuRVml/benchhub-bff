import { z } from 'zod';

// Shapes shared by the presentation views (V-40..V-43) and the builder autosave (C-28).

/** Template ids of the builder (V-41 `templateId`); C-28 answers INVALID_TEMPLATE for anything else. */
export const presentationTemplateIdSchema = z.enum(['directorio', 'storytelling', 'analitico']);

/** Presentation status (V-40 prose): front labels "Publicado" / "En revisión" / "Borrador". */
export const presentationStatusSchema = z.enum(['published', 'in_review', 'draft']);

/** Template accent colour key (V-41 example): directorio, storytelling, analitico → detalleAnalitico. */
export const templateAccentKeySchema = z.enum([
  'template.directorio',
  'template.storytelling',
  'template.detalleAnalitico',
]);

/** Presentation language (V-41 prose `es | en`). */
export const presentationLanguageSchema = z.enum(['es', 'en']);
