import { z } from 'zod';

import { authErrorEnvelopeSchema } from './auth-shared.js';

// A-03 — Logout: POST /api/v1/auth/logout (docs/requirements/view-data-contracts/A-03-auth-logout.md).
// Success is 204 No Content (also for an expired session, so "Salir" always ends on /login). The contract example is
// the 403 CSRF_INVALID error body, the only JSON of this endpoint.

/** No body: there are no path or query params and the command carries no data. */
export const a03RequestSchema = z.object({}).strict();

export const a03ResponseSchema = authErrorEnvelopeSchema;

export type A03Request = z.infer<typeof a03RequestSchema>;
export type A03Response = z.infer<typeof a03ResponseSchema>;
