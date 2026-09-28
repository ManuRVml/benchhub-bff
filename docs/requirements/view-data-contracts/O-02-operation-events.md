<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/O-02-operation-events.md · copied 2026-09-25 -->

# O-02 — Operation events (SSE)

- Endpoint: `GET /api/v1/operations/:operationId/events`
  `text/event-stream`. Typed events `progress`, `succeeded`, `failed`; the stream closes after `succeeded`/`failed`.
  `Last-Event-ID` lets the client resume; heartbeat comments every 15 s keep proxies from closing the stream [inference].
- Screens: same as O-01 (SCR-07 generation, SCR-08 "Actualizar" F22 and export, SCR-11 apply configuration and download,
  SCR-13/SCR-14 download). Preferred over polling.
- Params: `operationId` (path, branded). Nothing in the SPA URL.
- Response (minimal JSON): the `data:` payload of one `progress` event. `succeeded` carries `result`, `failed` carries
  `error`, with the same shapes as O-01:
  ```json
  {
    "operationId": "op_01J9ZM0Q4A",
    "status": "running",
    "progressPct": 70,
    "messageKey": "operation.analysisGeneration.homologating"
  }
  ```
- Raw vs derived: same as O-01. The BFF emits phase changes; `progressPct` is an integer; the front formats and resolves
  keys. No job ids or storage paths are ever emitted.
- Sections: n/a (event stream). If the stream fails, the front falls back to polling O-01 (degradation, not failure).
- Permissions: same rule as O-01 (the starter or a user with access to the target; otherwise `404` before the stream opens).
- budgetBytes: 512
- Commands used: none directly (it follows C-03, C-08, C-14, C-17).
