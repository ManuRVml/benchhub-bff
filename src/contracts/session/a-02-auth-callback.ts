import { z } from 'zod';

import { inAppPathSchema } from './auth-shared.js';

// A-02 — Login callback: GET /api/v1/auth/callback (docs/requirements/view-data-contracts/A-02-auth-callback.md).
// Called by Entra ID, never by the SPA; answers 302 with no body. The contract shows the redirect decision as data:
// the `Location` target and the four SCR-01 login error codes.

/** IdP errors mapped to the SCR-01 error codes (i18n on the front). */
export const loginErrorCodeSchema = z.enum([
  'access_denied',
  'session_expired',
  'idp_error',
  'unknown',
]);

export const a02ResponseSchema = z
  .object({
    // `/acceso` (hasAdminAccess and requiresGate), else `returnTo`, else `/inicio`; failures `/login?error=…&returnTo=`.
    location: inAppPathSchema,
    loginErrorCodes: z.array(loginErrorCodeSchema),
  })
  .strict();

// Query from the IdP: `code` + `state` on success; `error` (+ `error_description`) when the user cancels or is not
// assigned, in which case the IdP sends no `code`.
export const a02QuerySchema = z
  .object({
    code: z.string().min(1).optional(),
    state: z.string().min(1),
    error: z.string().min(1).optional(),
    error_description: z.string().optional(),
  })
  .strict()
  .refine((query) => query.code !== undefined || query.error !== undefined, {
    message: 'the IdP callback carries either `code` or `error`',
  });

export type A02Response = z.infer<typeof a02ResponseSchema>;
export type A02Query = z.infer<typeof a02QuerySchema>;
