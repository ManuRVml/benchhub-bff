import { expect } from 'vitest';

import type { z } from 'zod';

const VARIANTS = {
  error: { status: 'error', errorCode: 'PROVIDER_ERROR' },
  forbidden: { status: 'forbidden' },
} as const;

/**
 * For every named section, replaces it in the example with the `error` and the `forbidden` SectionResult variant and
 * asserts the response schema still parses: a schema that only allows `status: 'ok'` fails here.
 */
export function expectSectionVariants(
  responseSchema: z.ZodType,
  exampleWithSections: Record<string, unknown>,
  sectionNames: readonly string[],
): void {
  expect(sectionNames.length).toBeGreaterThan(0);
  for (const name of sectionNames) {
    expect(exampleWithSections, `section ${name} is missing from the example`).toHaveProperty(name);
    for (const [kind, variant] of Object.entries(VARIANTS)) {
      const result = responseSchema.safeParse({ ...exampleWithSections, [name]: variant });
      expect(result.success, `section ${name} must accept the ${kind} variant`).toBe(true);
    }
  }
}
