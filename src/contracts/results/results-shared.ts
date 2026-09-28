import { z } from 'zod';

import { categoryIdSchema } from '../common/ids.js';

// Shapes shared by the Resultados views of this row (V-09..V-14).

/** Horizon of an analysis (SCR-08 segmented control); the URL `horizonte=tbg-ilp` maps to `union` in the front. */
export const horizonSchema = z.enum(['tbg', 'ilp', 'union']);

/** Horizon of a module that is hidden in `union` (V-10, V-13): only `tbg | ilp` reach its view. */
export const singleHorizonSchema = horizonSchema.exclude(['union']);

/** Weight dimensions of an indicator group: Financiera / Operativa / Transversal. */
export const dimensionSchema = z.enum(['fin', 'op', 'trans']);

/** Indicator category as shown in chips, accordions and tables. */
export const categoryRefSchema = z.object({ id: categoryIdSchema, label: z.string() }).strict();
