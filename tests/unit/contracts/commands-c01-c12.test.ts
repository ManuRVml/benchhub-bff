import { describe, expect, it } from 'vitest';

import { c01RequestSchema } from '../../../src/contracts/commands/c-01-create-analysis-draft.js';
import { c02RequestSchema } from '../../../src/contracts/commands/c-02-save-analysis-draft.js';
import { c07RequestSchema } from '../../../src/contracts/commands/c-07-batch-weight-overrides.js';
import { c08RequestSchema } from '../../../src/contracts/commands/c-08-recalculations.js';
import { c09RequestSchema } from '../../../src/contracts/commands/c-09-publish-analysis.js';
import { c11RequestSchema } from '../../../src/contracts/commands/c-11-update-review-comment.js';

// Round-trips and strictness of C-01..C-12 are covered by the generic manifest-driven test
// (registry.contract.test.ts); these are the rules from the prose that the examples do not exercise.
describe('C-01..C-12 command rules', () => {
  it('C-01 rejects an analysis type outside the three allowed ones (INVALID_TYPE)', () => {
    expect(c01RequestSchema.safeParse({ type: 'otro' }).success).toBe(false);
    expect(c01RequestSchema.safeParse({ type: 'generacion_valor' }).success).toBe(true);
  });

  it('C-02 accepts only wizard steps 1..5 (INVALID_STEP)', () => {
    expect(c02RequestSchema.safeParse({ step: 6, fields: {} }).success).toBe(false);
    expect(c02RequestSchema.safeParse({ step: 0, fields: {} }).success).toBe(false);
    expect(
      c02RequestSchema.safeParse({ step: 5, fields: { companies: ['cmp_shell'] } }).success,
    ).toBe(true);
  });

  it('C-07 rejects weights outside 0..100 (INVALID_WEIGHT)', () => {
    const weights = (weight: number) => ({
      weights: [{ indicatorId: 'ind_margen_ebitda', weight }],
    });
    expect(c07RequestSchema.safeParse(weights(101)).success).toBe(false);
    expect(c07RequestSchema.safeParse(weights(-1)).success).toBe(false);
    expect(c07RequestSchema.safeParse(weights(100)).success).toBe(true);
  });

  it('C-08 needs an analysisId or the monitor flag (MISSING_CONTEXT)', () => {
    expect(c08RequestSchema.safeParse({ reason: 'manual-trigger' }).success).toBe(false);
    expect(c08RequestSchema.safeParse({ reason: 'manual-trigger', monitor: false }).success).toBe(
      false,
    );
    expect(c08RequestSchema.safeParse({ reason: 'manual-trigger', monitor: true }).success).toBe(
      true,
    );
  });

  it('C-09 needs at least one known product (INVALID_PRODUCTS)', () => {
    expect(c09RequestSchema.safeParse({ analysisId: 'ana_1', products: [] }).success).toBe(false);
    expect(c09RequestSchema.safeParse({ analysisId: 'ana_1', products: ['video'] }).success).toBe(
      false,
    );
  });

  it('C-11 accepts only the three review comment states (INVALID_STATUS)', () => {
    expect(c11RequestSchema.safeParse({ status: 'cerrado' }).success).toBe(false);
    expect(c11RequestSchema.safeParse({ status: 'in_analysis' }).success).toBe(true);
    // CF-101: the former Spanish literals are no longer valid.
    expect(c11RequestSchema.safeParse({ status: 'en_analisis' }).success).toBe(false);
  });
});
