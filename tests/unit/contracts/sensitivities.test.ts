import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  v37QuerySchema,
  v37ResponseSchema,
} from '../../../src/contracts/sensitivities/v-37-sensitivity-drivers.js';
import { v38ResponseSchema } from '../../../src/contracts/sensitivities/v-38-sensitivity-scenarios.js';
import { v39ResponseSchema } from '../../../src/contracts/sensitivities/v-39-weight-simulator.js';

// Round-trips and strictness of V-37..V-39 are covered by the generic manifest-driven test
// (registry.contract.test.ts); these are the prose rules the examples do not exercise.
const example = (id: string): Record<string, unknown> =>
  JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- ids are the literals of this file
    readFileSync(new URL(`../../contract-examples/${id}.response.json`, import.meta.url), 'utf8'),
  ) as Record<string, unknown>;

describe('V-37..V-39 prose rules', () => {
  it('V-37 defaults the indicator query param to ind_roace', () => {
    expect(v37QuerySchema.parse({})).toEqual({ indicator: 'ind_roace' });
    expect(v37QuerySchema.parse({ indicator: 'ind_margen_ebitda' })).toEqual({
      indicator: 'ind_margen_ebitda',
    });
    expect(v37QuerySchema.safeParse({ indicador: 'ind_roace' }).success).toBe(false);
  });

  it('V-37 accepts a validated suggestion and rejects unknown suggestion states', () => {
    const base = example('V-37');
    const suggestion = base.suggestion as Record<string, unknown>;
    const validated = {
      ...base,
      suggestion: {
        ...suggestion,
        status: 'validated',
        validatedBy: 'usr_camila_bravo',
        validatedAt: '2026-09-25T10:00:00-05:00',
      },
    };
    expect(v37ResponseSchema.safeParse(validated).success).toBe(true);
    const unknown = { ...base, suggestion: { ...suggestion, status: 'approved' } };
    expect(v37ResponseSchema.safeParse(unknown).success).toBe(false);
  });

  it('V-38 presets are the three CF-124 scenarios, optional, keyed by the CF-125 variables', () => {
    const base = example('V-38');
    const [preset] = base.presets as Record<string, unknown>[];
    expect(v38ResponseSchema.safeParse({ ...base, presets: [{ id: 'p1' }] }).success).toBe(false);
    expect(
      v38ResponseSchema.safeParse({ ...base, presets: [{ ...preset, id: 'pessimistic' }] }).success,
    ).toBe(false);
    expect(
      v38ResponseSchema.safeParse({
        ...base,
        presets: [{ ...preset, values: { productivity: 0, costs: 0 } }],
      }).success,
    ).toBe(false);
    const withoutPresets = Object.fromEntries(
      Object.entries(base).filter(([key]) => key !== 'presets'),
    );
    expect(v38ResponseSchema.safeParse(withoutPresets).success).toBe(true);
  });

  it('V-39 accepts only the ok / watch / critical bands and watch / action tones', () => {
    const base = example('V-39');
    const [category] = base.categories as Record<string, unknown>[];
    const [kvi] = (category?.kvis ?? []) as Record<string, unknown>[];
    const withBand = (band: string) => ({
      ...base,
      categories: [{ ...category, kvis: [{ ...kvi, band }] }],
    });
    expect(v39ResponseSchema.safeParse(withBand('critical')).success).toBe(true);
    expect(v39ResponseSchema.safeParse(withBand('danger')).success).toBe(false);
    const [recommendation] = base.recommendations as Record<string, unknown>[];
    const withTone = { ...base, recommendations: [{ ...recommendation, tone: 'ok' }] };
    expect(v39ResponseSchema.safeParse(withTone).success).toBe(false);
  });
});
