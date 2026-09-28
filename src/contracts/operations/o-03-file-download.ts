import { z } from 'zod';

import { ApiErrorSchema } from '../common/api-error.js';

// O-03 — Mediated file download: GET /api/v1/files/:fileId/download?disposition=attachment
// (docs/requirements/view-data-contracts/O-03-file-download.md). Success is the permission-checked binary stream (no
// JSON, no storage path or signed URL); the JSON contract is the error body of a 403 / 404.

export const o03RequestSchema = z
  .object({
    /** `inline` for images and the avatar. */
    disposition: z.enum(['attachment', 'inline']).default('attachment'),
  })
  .strict();

/** CF-118: the error body is the common ApiError. */
export const o03ResponseSchema = ApiErrorSchema;

export type O03Request = z.infer<typeof o03RequestSchema>;
export type O03Response = z.infer<typeof o03ResponseSchema>;
