import { describe, expect, it } from 'vitest';

import { c15RequestSchema } from '../../../src/contracts/commands/c-15-generate-executive-narrative.js';

// CF-102: analysisId is required for scope `results` and omitted for scope `value-monitor`.
describe('C-15 request analysisId rule', () => {
  it('accepts results with an analysisId and value-monitor without one', () => {
    expect(
      c15RequestSchema.safeParse({
        scope: 'results',
        section: 'overview',
        analysisId: 'ana_01J9Y8D4T2',
      }).success,
    ).toBe(true);
    expect(
      c15RequestSchema.safeParse({ scope: 'value-monitor', section: 'overview' }).success,
    ).toBe(true);
  });

  it('rejects results without an analysisId and value-monitor with one', () => {
    expect(c15RequestSchema.safeParse({ scope: 'results', section: 'overview' }).success).toBe(
      false,
    );
    expect(
      c15RequestSchema.safeParse({
        scope: 'value-monitor',
        section: 'overview',
        analysisId: 'ana_01J9Y8D4T2',
      }).success,
    ).toBe(false);
  });
});
