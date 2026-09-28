<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-46-assistant-context.md · copied 2026-09-25 -->

# V-46 — Assistant context (Yarbis proactive tip and suggestions)

- Endpoint: `GET /api/v1/views/assistant-context?screen=inicio&analysisId=`
  What the Yarbis panel offers on the current screen: the proactive tip (shown once per screen per session) and the
  suggestion chips. Chat turns are C-33 (SSE), not this view. `Cache-Control: private, no-cache`.
- Screens: SCR-04 App shell — `Cmp:YarbisFab` + `Cmp:YarbisChatPanel` (OVL-14), panel title "✦ Yarbis · {screen title}",
  proactive message bubble, suggestion chips, input, 👍/👎 per AI message. Present on SCR-05..SCR-16 when the role may use the
  assistant.
- Params:
  - `screen` (query, enum `inicio | analisis | definicion | resultados | visualizacion | detalle | sensibilidades | valor |
presentaciones | notificaciones | configuracion`, required; derived by the front from the current route, not a new URL
    param).
  - `analysisId` (query, optional; from the route when the screen belongs to an analysis, so tips can cite its data).
- Response (minimal JSON):
  ```json
  {
    "proactiveTip": {
      "id": "tip_inicio_2026-09-25",
      "text": "Hola, soy Yarbis. Detecté 3 cambios relevantes en el sector durante las últimas 24 horas — pregúntame por cualquier cifra, indicador o compañía.",
      "aiStatus": "suggestion"
    },
    "suggestions": [
      "¿Qué análisis tengo pending?",
      "¿Cómo está Ecopetrol vs. pares?"
    ],
    "permissions": { "canUseAssistant": true }
  }
  ```
- Raw vs derived:
  - No numbers to format; texts are sent ready to display (AI or template output, es-CO).
  - BFF derives: the per-screen tip (V2 `PROACTIVE` map, HTML L3224–3237) and the per-screen suggestions (V2 `suggestionsMap`,
    HTML L5158–5167). The tip `id` identifies the tip, so the front shows each tip once per session (session storage of seen
    ids) [inference: V2 `aiSeenScreens`]. `proactiveTip: null` when a screen has none (e.g. `analisis`, SCR-06).
  - Every AI text carries `aiStatus: 'suggestion'` and is logged with model/version on the BFF (AI output log, P4-38).
- Sections: single object; independent of the host view. On failure, the panel opens without a tip or chips and shows an
  inline error with retry (SCR-04 States); the host screen is unaffected.
- Permissions: `canUseAssistant` (analyst_creator and executive_integral, CF-40). When false, the FAB and panel are hidden and
  the endpoint answers `403`.
- budgetBytes: 2048
- Commands used:
  - C-33 `POST /api/v1/assistant/messages` → SSE events `token`, `citation`, `done`, `error` (chat turn; chips send their text).
  - C-34 `POST /api/v1/assistant/feedback` `{messageId, rating: up|down}` (👍 / 👎).
