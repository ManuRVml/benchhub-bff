import { z } from 'zod';

import { analysisIdSchema, assistantMessageIdSchema } from '../common/ids.js';
import { shellScreenSchema } from '../common/screens.js';

// C-33 — Send assistant message: POST /api/v1/assistant/messages
// (docs/requirements/view-data-contracts/C-33-send-assistant-message.md). F04; the response is a Server-Sent Events
// stream and this schema is one event of it.

/** CF-112: the 12 in-shell screens the Yarbis panel can be opened on. */
export const assistantScreenSchema = shellScreenSchema;

export const c33RequestSchema = z
  .object({
    message: z.string().min(1),
    context: z
      .object({
        analysisId: analysisIdSchema.optional(),
        screen: assistantScreenSchema,
      })
      .strict(),
  })
  .strict();

/**
 * One SSE event, a union on `type` (CF-111): `token` / `citation` carry `content`, `done` the `messageId` C-34 rates,
 * `error` an `errorCode` such as ASSISTANT_UNAVAILABLE.
 */
export const c33ResponseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('token'), content: z.string() }).strict(),
  z.object({ type: z.literal('citation'), content: z.string() }).strict(),
  z.object({ type: z.literal('done'), messageId: assistantMessageIdSchema }).strict(),
  z.object({ type: z.literal('error'), errorCode: z.string().min(1) }).strict(),
]);

export type C33Request = z.infer<typeof c33RequestSchema>;
export type C33Response = z.infer<typeof c33ResponseSchema>;
