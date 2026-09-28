import { z } from 'zod';

// Query-string building blocks for GET views: every query value arrives as a string, so numbers are coerced and lists
// are comma-separated. build-openapi documents the input side (a string, with its pattern and default).

/** Positive integer query value (`page`, `pageSize`, `step`): `"2"` → 2; empty, decimal or NaN is rejected. */
export const queryIntSchema = z.coerce.number().int().min(1);

/**
 * Comma-separated list (`a,b,c`) parsed into an array of `item`; empty or absent = `[]`, which the contracts read as
 * "all". Empty entries (`a,,b`) are rejected.
 */
export function commaListSchema<Item extends z.ZodType<unknown, string>>(item: Item) {
  return z
    .string()
    .regex(/^(?!,)(?!.*,,)(?!.*,$)/)
    .transform((raw) => (raw === '' ? [] : raw.split(',')))
    .pipe(z.array(item))
    .prefault('');
}
