import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  v26QuerySchema,
  v26ResponseSchema,
} from '../../../src/contracts/comments/v-26-comment-thread.js';
import { v25ResponseSchema } from '../../../src/contracts/company-profile/v-25-company-profile.js';
import {
  v24QuerySchema,
  v24ResponseSchema,
} from '../../../src/contracts/indicator-detail/v-24-indicator-detail.js';

// Round-trips, strictness and section variants of V-24..V-26 are covered by the generic manifest-driven test
// (registry.contract.test.ts); these are the prose rules the examples do not exercise.
const example = (id: string): Record<string, unknown> =>
  JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- ids are the literals of this file
    readFileSync(new URL(`../../contract-examples/${id}.response.json`, import.meta.url), 'utf8'),
  ) as Record<string, unknown>;

describe('V-24..V-26 prose rules', () => {
  it('V-24 accepts only the SCR-10 units and the three origins', () => {
    const base = example('V-24');
    const indicator = base.indicator as Record<string, unknown>;
    expect(
      v24ResponseSchema.safeParse({ ...base, indicator: { ...indicator, unit: 'kboe' } }).success,
    ).toBe(true);
    expect(
      v24ResponseSchema.safeParse({ ...base, indicator: { ...indicator, unit: 'cop' } }).success,
    ).toBe(false);
    expect(v24QuerySchema.parse({})).toEqual({});
    expect(v24QuerySchema.safeParse({ origin: 'presentacion' }).success).toBe(true);
    expect(v24QuerySchema.safeParse({ origin: 'home' }).success).toBe(false);
  });

  it('V-25 sends null attributes for an unknown profile and null news when the provider fails', () => {
    const base = example('V-25');
    const unknown = {
      ...base,
      country: null,
      category: null,
      business: null,
      segments: [],
      news: null,
    };
    expect(v25ResponseSchema.safeParse(unknown).success).toBe(true);
    const news = base.news as unknown[];
    const four = { ...base, news: [news[0], news[0], news[0], news[0]] };
    expect(v25ResponseSchema.safeParse(four).success).toBe(false);
  });

  it('V-26 keeps status for comments and decision for change requests', () => {
    const base = example('V-26');
    const [comment, change] = base.items as Record<string, unknown>[];
    const withThreads = (items: unknown[]) => ({ ...base, items });
    expect(
      v26ResponseSchema.safeParse(withThreads([{ ...change, decision: 'accepted' }])).success,
    ).toBe(true);
    expect(
      v26ResponseSchema.safeParse(withThreads([{ ...comment, decision: 'accepted' }])).success,
    ).toBe(false);
    expect(
      v26ResponseSchema.safeParse(withThreads([{ ...change, status: 'pending' }])).success,
    ).toBe(false);
    expect(
      v26ResponseSchema.safeParse(withThreads([{ ...comment, status: 'closed' }])).success,
    ).toBe(false);
  });

  it('V-26 query requires the entity (CF-132 enum), coerces page and defaults it to 1', () => {
    expect(v26QuerySchema.parse({ entityType: 'indicator', entityId: 'ana_1:ind_roace' })).toEqual({
      entityType: 'indicator',
      entityId: 'ana_1:ind_roace',
      page: 1,
    });
    expect(
      v26QuerySchema.parse({ entityType: 'analysis', entityId: 'ana_1', page: '3' }).page,
    ).toBe(3);
    expect(v26QuerySchema.safeParse({ entityType: 'company', entityId: 'cmp_shell' }).success).toBe(
      true,
    );
    expect(v26QuerySchema.safeParse({ entityType: 'slide', entityId: 'sld_1' }).success).toBe(
      false,
    );
    expect(v26QuerySchema.safeParse({ entityType: 'analysis' }).success).toBe(false);
  });
});
