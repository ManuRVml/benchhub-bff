import { z } from 'zod';

import { dimensionSchema } from '../results/results-shared.js';

// Shapes shared by the Visualización views of this row (V-20..V-23).

/** Engine tier of a category, indicator or the overall position: 1 (best) to 4; names and colours are front-only. */
export const tierIdSchema = z.number().int().min(1).max(4);

/** A declared weight (%) per dimension: Financiera / Operativa / Transversal. */
export const dimensionWeightsSchema = z
  .object({ fin: z.number().min(0), op: z.number().min(0), trans: z.number().min(0) })
  .strict();

/** Company weight sum vs 100 %: `ok` within 99,5–100,5, `over`, `under` (same rule as V-17). */
export const sumStatusSchema = z.enum(['ok', 'over', 'under']);

/** Query of the Visualización views that follow the URL `ranking` / tab dimension. */
export const dimensionQuerySchema = z
  .object({ dimension: dimensionSchema.default('fin') })
  .strict();
