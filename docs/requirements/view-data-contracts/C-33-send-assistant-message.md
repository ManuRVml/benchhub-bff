<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-33-send-assistant-message.md · copied 2026-09-25 -->

# C-33 — Send assistant message

- Endpoint: `POST /api/v1/assistant/messages`
- Triggered from: SCR-14 "Presentación · detalle" / SCR-05 "Inicio" → Yarbis chat panel (HTML L2100–2595, L3176)
- Request (minimal JSON):
```json
{
  "message": "user-message-text",
  "context": {
    "analysisId": "optional-branded-id",
    "screen": "inicio|analisis|definicion|resultados|visualizacion|detalle-indicador|monitor-valor|sensibilidades|presentaciones|presentacion-detalle|notificaciones|configuracion"
  }
}
```
- Response: Server-Sent Events (SSE) stream with discriminated union events:
  - `token` event — streaming content chunk:
    ```json
    { "type": "token", "content": "…" }
    ```
  - `citation` event — citation reference:
    ```json
    { "type": "citation", "content": "…" }
    ```
  - `done` event — stream complete, includes messageId for feedback:
    ```json
    { "type": "done", "messageId": "msg_1" }
    ```
  - `error` event — stream terminated with error:
    ```json
    { "type": "error", "errorCode": "ASSISTANT_UNAVAILABLE" }
    ```
- Prose:
  - Events are a discriminated union on `type` (`"token"|"citation"|"done"|"error"`).
  - `content` (string) — text chunk or citation reference for `token`/`citation` events.
  - `messageId` (string, branded) — unique message identifier for `done` events; used by C-34 feedback.
  - `errorCode` (string) — error code such as `"ASSISTANT_UNAVAILABLE"` for `error` events.
- Permission required: `analyst_creator` role; any authenticated user with assistant access
- Validation / errors:
  - MESSAGE_REQUIRED: message field is required
  - CONTEXT_REQUIRED: context.screen is required for proper routing
  - FORBIDDEN: user lacks assistant access
- Side effects: Streams token-by-token response; retrieves citations; handles errors gracefully
- budgetBytes: 16384
- Notes: Server-Sent Events (SSE) streaming; feature F04
