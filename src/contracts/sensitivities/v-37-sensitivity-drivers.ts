import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import {
  indicatorIdSchema,
  leverIdSchema,
  suggestionIdSchema,
  userIdSchema,
} from '../common/ids.js';
import { UnitCodeSchema } from '../common/units.js';

// V-37 — Sensitivity drivers: GET /api/v1/views/sensitivity-drivers?indicator=
// (docs/requirements/view-data-contracts/V-37-sensitivity-drivers.md). SCR-12 §1: indicator pills, formula, levers,
// base / target and the Yarbis suggestion. Simulated values come from C-21, never from this view.
// Bare payload per module; a failure is the endpoint ApiError (CF-123).

/** `ind_roace`: the documented default of the `indicator` query param (URL `indicador`). */
export const V37_DEFAULT_INDICATOR = indicatorIdSchema.parse('ind_roace');

/** Query params; an indicator that is not `isReady` falls back to ROACE on the BFF. */
export const v37QuerySchema = z
  .object({ indicator: indicatorIdSchema.default(V37_DEFAULT_INDICATOR) })
  .strict();

export const v37IndicatorSchema = z
  .object({
    id: indicatorIdSchema,
    label: z.string(),
    isReady: z.boolean(),
  })
  .strict();

export const v37FormulaSchema = z
  .object({
    expression: z.string(),
    terms: z.array(z.string()),
  })
  .strict();

export const v37LinkedVariableSchema = z
  .object({
    label: z.string(),
    unit: UnitCodeSchema,
    /** Multiplier applied to the lever value to show the linked variable (recalculated by C-21). */
    factor: z.number(),
  })
  .strict();

export const v37LeverSchema = z
  .object({
    id: leverIdSchema,
    label: z.string(),
    unit: UnitCodeSchema,
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    default: z.number(),
    linked: v37LinkedVariableSchema.optional(),
  })
  .strict();

export const v37ValueSchema = z
  .object({
    value: z.number(),
    unit: UnitCodeSchema,
  })
  .strict();

export const v37SuggestionSchema = z
  .object({
    id: suggestionIdSchema,
    /** Suggested value per lever id. */
    levers: z.record(leverIdSchema, z.number()),
    estimatedResult: z.number(),
    /** A Yarbis suggestion needs human validation (BR-22, C-22). */
    status: z.enum(['requires_validation', 'validated']),
    validatedBy: userIdSchema.nullable(),
    validatedAt: z.iso.datetime({ offset: true }).nullable(),
  })
  .strict();

export const v37ResponseSchema = z
  .object({
    indicators: z.array(v37IndicatorSchema),
    formula: v37FormulaSchema,
    levers: z.array(v37LeverSchema),
    base: v37ValueSchema,
    target: v37ValueSchema,
    suggestion: v37SuggestionSchema,
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V37Query = z.infer<typeof v37QuerySchema>;
export type V37Response = z.infer<typeof v37ResponseSchema>;
