import { z } from 'zod';

/**
 * Provenance of AI-generated content (CF-110): the generator's model and version, never infrastructure ids. One shape
 * everywhere: C-15, C-32, V-14, V-35, V-36.
 */
export const generatedBySchema = z
  .object({
    model: z.string().min(1),
    version: z.string().min(1),
  })
  .strict();

export type GeneratedBy = z.infer<typeof generatedBySchema>;
