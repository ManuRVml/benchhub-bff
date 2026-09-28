import { z } from 'zod';

import { analysisIdSchema, publicationIdSchema } from '../common/ids.js';

// C-09 — Publish analysis: POST /api/v1/publications
// (web@d4c7ea2 docs/design/view-data-contracts/C-09-publish-analysis.md). Creates an immutable PublicationManifest.

export const publicationProductSchema = z.enum(['report', 'presentation']);

export const c09RequestSchema = z
  .object({
    analysisId: analysisIdSchema,
    /** INVALID_PRODUCTS when empty or with an unknown product type. */
    products: z.array(publicationProductSchema).min(1),
  })
  .strict();

export const publicationManifestSchema = z
  .object({
    id: publicationIdSchema,
    /** The analysis lifecycleState after publishing. */
    status: z.enum(['published']),
    createdAt: z.iso.datetime({ offset: true }),
    products: z.array(publicationProductSchema).min(1),
  })
  .strict();

export const c09ResponseSchema = z
  .object({ publicationManifest: publicationManifestSchema })
  .strict();

export type C09Request = z.infer<typeof c09RequestSchema>;
export type C09Response = z.infer<typeof c09ResponseSchema>;
