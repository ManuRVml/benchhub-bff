import { z } from 'zod';

// O-04 — Health probe: GET /api/v1/health (docs/requirements/view-data-contracts/O-04-health-ready.md). Liveness only,
// always 200; readiness moved to O-05 `/ready` (CF-119). Public operational probe, not called by the SPA.

export const o04ResponseSchema = z
  .object({
    /** Always `ok` for liveness. */
    status: z.literal('ok'),
    /** Package version. */
    version: z.string().min(1),
  })
  .strict();

export type O04Response = z.infer<typeof o04ResponseSchema>;
