import { z } from 'zod';

import { a04ResponseSchema } from './a-04-session.js';

// A-05 — Mock password login: POST /api/v1/auth/password-login
// (docs/requirements/view-data-contracts/A-05-password-login.md). Owner decision 2026-09-28 (overrides web CF-29): the
// SCR-01 card posts a username and a password. Only the mock BFF serves it, against one configured credential pair;
// the production target stays OIDC (A-01/A-02). It is the login itself, so it needs no session and no CSRF token.

/**
 * Body: the corporate e-mail (trimmed, at most 254 characters) and the password (1..128 characters, never trimmed).
 * No `returnTo`: the SPA keeps it and navigates itself after a 200, so the BFF would only echo it back.
 */
export const a05RequestSchema = z
  .object({
    // Trim first, then check the e-mail (z.email().trim() would validate before trimming); the pipe hides the format
    // from zod-to-openapi, so the meta states it for the spec.
    username: z.string().trim().max(254).pipe(z.email()).meta({ format: 'email' }),
    password: z.string().min(1).max(128),
  })
  .strict();

/**
 * 200: the session is established (session cookie + synchronizer CSRF token, as after A-02) and the body is the A-04
 * session of the new user, `csrfToken` included, so the SPA may seed its session cache. Wrong credentials answer 401
 * with the common ApiError `INVALID_CREDENTIALS` and one generic message, whichever field was wrong; a malformed body
 * answers 400 `BAD_REQUEST`.
 */
export const a05ResponseSchema = a04ResponseSchema;

export type A05Request = z.infer<typeof a05RequestSchema>;
export type A05Response = z.infer<typeof a05ResponseSchema>;
