import { z } from 'zod';

// O-05 — Readiness probe: GET /api/v1/ready (docs/requirements/view-data-contracts/O-05-ready.md), split from O-04 by
// CF-119. Answers 503 when a required check fails, 200 otherwise. Public operational probe, not called by the SPA.

export const healthStatusSchema = z.enum(['ok', 'degraded', 'failing']);

export const o05ResponseSchema = z
  .object({
    /** Derived by the BFF from the checks. */
    status: healthStatusSchema,
    version: z.string().min(1),
    /** Logical port names, never hostnames, connection strings or table names. */
    checks: z.array(z.object({ name: z.string().min(1), status: healthStatusSchema }).strict()),
  })
  .strict();

export type O05Response = z.infer<typeof o05ResponseSchema>;
