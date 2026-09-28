import { z } from 'zod';

// Shapes shared by the auth contracts of this row (A-01..A-04).

/**
 * Error body the auth contracts show (A-01 503, A-03 403): `{ error: { code, messageKey, traceId } }`. It differs from
 * the common ApiError (`{ code, message, traceId, details? }`, brief L278); listed as a divergence of the row.
 */
export const authErrorEnvelopeSchema = z
  .object({
    error: z
      .object({
        code: z.string().min(1),
        // i18n key resolved by the front (e.g. `auth.error.providerUnavailable`).
        messageKey: z.string().min(1),
        traceId: z.string().min(1),
      })
      .strict(),
  })
  .strict();

/** The five functional roles of synthesis §1.19. */
export const roleSchema = z.enum([
  'analyst_creator',
  'explorer_viewer',
  'explorer_integral',
  'executive_viewer',
  'executive_integral',
]);

/** In-app relative path: starts with one "/" (never "//…", which would leave the origin). */
export const inAppPathSchema = z.string().regex(/^\/(?!\/)/);

export type AuthErrorEnvelope = z.infer<typeof authErrorEnvelopeSchema>;
export type Role = z.infer<typeof roleSchema>;
