import { z } from 'zod';

// C-02 — Save analysis draft step: PATCH /api/v1/analysis-drafts/:draftId
// (web@d4c7ea2 docs/design/view-data-contracts/C-02-save-analysis-draft.md). Autosave of the SCR-07 5-step wizard.

/**
 * A wizard field value. The contract names no field set (`"fieldName": "value"`), so the value domain is the scalars
 * and string lists the wizard inputs produce (text, number, toggle, cleared value, multi-select).
 */
export const draftFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
]);

export const c02RequestSchema = z
  .object({
    /** Wizard step 1..5 (INVALID_STEP otherwise). */
    step: z.number().int().min(1).max(5),
    fields: z.record(z.string().min(1), draftFieldValueSchema),
  })
  .strict();

/** One failed business rule of the saved step (VALIDATION_ERROR); the web maps `code` to its own copy. */
export const draftValidationErrorSchema = z
  .object({
    field: z.string().min(1),
    code: z.string().min(1),
  })
  .strict();

export const c02ResponseSchema = z
  .object({
    validationState: z
      .object({
        isValid: z.boolean(),
        errors: z.array(draftValidationErrorSchema),
      })
      .strict(),
  })
  .strict();

export type C02Request = z.infer<typeof c02RequestSchema>;
export type C02Response = z.infer<typeof c02ResponseSchema>;
