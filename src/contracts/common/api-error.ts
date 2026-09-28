import { z } from 'zod';

/**
 * Error body of every non-2xx response (brief L278). `details` is optional diagnostic data: any JSON value (`z.json()`),
 * so it survives serialisation; the UI never shows it verbatim.
 */
export const ApiErrorSchema = z
  .object({
    code: z.string(),
    message: z.string(),
    traceId: z.string(),
    details: z.json().optional(),
  })
  .strict();

export type ApiError = z.infer<typeof ApiErrorSchema>;
