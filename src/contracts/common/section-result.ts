import { z } from 'zod';

/**
 * One independently loaded section of a view (brief L278): `{ status: 'ok', data }` | `{ status: 'error', errorCode }` |
 * `{ status: 'forbidden' }`. A view answers 200 with failed or hidden sections instead of failing as a whole (brief §4.1.4).
 */
export function sectionResult<Data extends z.ZodType>(data: Data) {
  return z.discriminatedUnion('status', [
    z.object({ status: z.literal('ok'), data }).strict(),
    z.object({ status: z.literal('error'), errorCode: z.string().min(1) }).strict(),
    z.object({ status: z.literal('forbidden') }).strict(),
  ]);
}

export type SectionResult<Data> =
  { status: 'ok'; data: Data } | { status: 'error'; errorCode: string } | { status: 'forbidden' };

/** Example values of the three variants around `data`, for tests and contract examples. */
export function sectionExamples<Data>(data: Data) {
  return {
    ok: { status: 'ok', data },
    error: { status: 'error', errorCode: 'PROVIDER_ERROR' },
    forbidden: { status: 'forbidden' },
  } as const satisfies Record<string, SectionResult<Data>>;
}
