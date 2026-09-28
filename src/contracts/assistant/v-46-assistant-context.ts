import { z } from 'zod';

import { ActionPermissionsSchema } from '../common/action-permissions.js';
import { analysisIdSchema } from '../common/ids.js';

// V-46 — Assistant context: GET /api/v1/views/assistant-context?screen=inicio&analysisId=
// (docs/requirements/view-data-contracts/V-46-assistant-context.md). What the Yarbis panel offers on the current screen:
// the proactive tip (shown once per screen per session) and the suggestion chips. Chat turns are C-33, not this view.
// Answers 403 without `canUseAssistant` (CF-40).

/** Screen the panel is open on; derived by the front from the current route. */
export const assistantContextScreenSchema = z.enum([
  'inicio',
  'analisis',
  'definicion',
  'resultados',
  'visualizacion',
  'detalle',
  'sensibilidades',
  'valor',
  'presentaciones',
  'notificaciones',
  'configuracion',
]);

export const v46ResponseSchema = z
  .object({
    /** null when the screen has no tip (e.g. `analisis`). */
    proactiveTip: z
      .object({
        /** Identifies the tip so the front shows each one once per session. */
        id: z.string().min(1),
        text: z.string(),
        aiStatus: z.literal('suggestion'),
      })
      .strict()
      .nullable(),
    /** Suggestion chips; sending one starts a C-33 chat turn with its text. */
    suggestions: z.array(z.string().min(1)),
    permissions: ActionPermissionsSchema,
  })
  .strict();

export type V46Response = z.infer<typeof v46ResponseSchema>;

/** Query: `screen` (required) and `analysisId` (when the screen belongs to an analysis). */
export const v46QuerySchema = z
  .object({
    screen: assistantContextScreenSchema,
    analysisId: analysisIdSchema.optional(),
  })
  .strict();

export type V46Query = z.infer<typeof v46QuerySchema>;
