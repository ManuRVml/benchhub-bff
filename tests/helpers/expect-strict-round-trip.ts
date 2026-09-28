import { expect } from 'vitest';

import type { z } from 'zod';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Asserts that `schema` accepts the contract example unchanged (parse output deep-equals the input) and is strict: the
 * example with an extra key is rejected. For an array example the extra key goes on its first item.
 */
export function expectStrictRoundTrip(schema: z.ZodType, example: unknown): void {
  expect(schema.parse(example)).toEqual(example);

  let withExtra: unknown;
  if (Array.isArray(example)) {
    const [first, ...rest] = example as unknown[];
    if (!isPlainObject(first))
      throw new Error('expectStrictRoundTrip: array example needs an object as first item');
    withExtra = [{ ...first, __extra: 1 }, ...rest];
  } else if (isPlainObject(example)) {
    withExtra = { ...example, __extra: 1 };
  } else {
    throw new Error('expectStrictRoundTrip: example must be an object or an array of objects');
  }
  expect(() => schema.parse(withExtra)).toThrow();
}
