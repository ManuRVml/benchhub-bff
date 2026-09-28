import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { sectionExamples, sectionResult } from '../../../src/contracts/common/section-result.js';
import { expectSectionVariants } from '../../helpers/expect-section-variants.js';
import { expectStrictRoundTrip } from '../../helpers/expect-strict-round-trip.js';

// The helpers must fail on the schema mistakes they exist to catch.
describe('contract test helpers', () => {
  const item = z.object({ id: z.string() }).strict();

  it('expectStrictRoundTrip rejects a non-strict object schema', () => {
    const loose = z.object({ id: z.string() });
    expect(() => {
      expectStrictRoundTrip(loose, { id: 'a' });
    }).toThrow();
    expectStrictRoundTrip(item, { id: 'a' });
  });

  it('expectStrictRoundTrip checks the first item of an array example', () => {
    expectStrictRoundTrip(z.array(item), [{ id: 'a' }, { id: 'b' }]);
    expect(() => {
      expectStrictRoundTrip(z.array(z.object({ id: z.string() })), [{ id: 'a' }]);
    }).toThrow();
  });

  it('expectSectionVariants rejects a section that only allows status ok', () => {
    const okOnly = z
      .object({ list: z.object({ status: z.literal('ok'), data: z.array(item) }).strict() })
      .strict();
    const example = { list: { status: 'ok', data: [{ id: 'a' }] } };
    expect(() => {
      expectSectionVariants(okOnly, example, ['list']);
    }).toThrow();
    expectSectionVariants(z.object({ list: sectionResult(z.array(item)) }).strict(), example, [
      'list',
    ]);
  });

  it('sectionExamples produces the three variants sectionResult accepts', () => {
    const schema = sectionResult(item);
    for (const variant of Object.values(sectionExamples({ id: 'a' }))) {
      expect(schema.parse(variant)).toEqual(variant);
    }
  });
});
