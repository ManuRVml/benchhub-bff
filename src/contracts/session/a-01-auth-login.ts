import { z } from 'zod';

import { authErrorEnvelopeSchema, inAppPathSchema } from './auth-shared.js';

// A-01 — Login redirect: GET /api/v1/auth/login (docs/requirements/view-data-contracts/A-01-auth-login.md).
// Full-page navigation answered with 302 to the Entra ID authorize URL (OIDC code + PKCE, token handler). The only JSON
// the SPA sees is the error body when the IdP metadata cannot be loaded (503), which is what the contract example shows.

export const a01ResponseSchema = authErrorEnvelopeSchema;

// Query: `returnTo` accepts only same-origin relative paths; anything else falls back to /inicio silently.
// `loginHint` ("Usuario o correo corporativo") is trimmed and forwarded as `login_hint`.
export const a01QuerySchema = z
  .object({
    // A transform, not .catch(): zod-to-openapi cannot document ZodCatch; the spec shows the input string.
    returnTo: z
      .string()
      .optional()
      .transform((value) =>
        value !== undefined && inAppPathSchema.safeParse(value).success ? value : '/inicio',
      ),
    loginHint: z.string().trim().optional(),
  })
  .strict();

export type A01Response = z.infer<typeof a01ResponseSchema>;
export type A01Query = z.infer<typeof a01QuerySchema>;
