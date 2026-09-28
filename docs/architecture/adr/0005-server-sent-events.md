# ADR-0005: Server-Sent Events for operation progress and assistant streaming

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L295 (long operations → `202 Accepted` + `operationId`, UI-oriented status, progress
  by SSE when the view needs it), L296 (assistant chat streamed by SSE with typed events `token`, `citation`, `done`,
  `error`), L412–414 (`GET /api/v1/operations/:operationId/events` (SSE), `POST /api/v1/assistant/messages` → SSE), L207
  (`compression` middleware), L116 (Databricks Apps deployment).

## Context

Two features push data from server to browser: progress of long operations (recalculation F22, exports, uploads) that are
started with `202 { operationId }` (L295, L409–412), and the Yarbis assistant chat, streamed token by token with citations
(L296). Both are one-way server → client, need to work through the Databricks Apps reverse proxy, and must keep the
same-origin cookie session (ADR-0004, ADR-0007). The stack includes the `compression` middleware (L207), which buffers
responses and breaks streaming unless excluded.

## Decision

1. **Transport: SSE (`text/event-stream`)** for both flows; no WebSockets.
2. **Operation progress:** `GET /api/v1/operations/:operationId/events`. Events: `progress` `{ status: 'queued'|'running',
   progress: 0..100, message }`, `done` `{ status: 'succeeded', resultUrl? }`, `error` `{ status: 'failed', errorCode,
   message }`. The stream closes after `done`/`error`. `GET /api/v1/operations/:operationId` remains the polling fallback with
   the same payload. Access requires the session that owns the operation (else `403`/`404`).
3. **Assistant chat:** `POST /api/v1/assistant/messages` (body validated with Zod, CSRF header required) answers with an SSE
   body. Typed events: `token` `{ text }`, `citation` `{ id, title, source, downloadUrl }` (download mediated by the BFF,
   L296–297), `done` `{ messageId, finishReason }`, `error` `{ errorCode, message }`. Each event's `data` is JSON validated
   against a Zod schema that is part of the contract (ADR-0002). Because it is a POST, the web consumes it with `fetch` +
   stream reader, not `EventSource`.
4. **Framing and liveness:** each event has `id:` (monotonic per stream) and `event:` names; a heartbeat comment (`: ping`)
   every 15 s; `retry: 3000` hint. `GET` streams honour `Last-Event-ID` by replaying from the operation's last known state
   (operations are state snapshots, so replay = send the current state). Chat streams are not resumable: on disconnect the
   client shows the partial answer with an error and can resend.
5. **Headers and middleware:** `Content-Type: text/event-stream; charset=utf-8`, `Cache-Control: no-cache, no-transform`,
   `Connection: keep-alive`, `X-Accel-Buffering: no`; `res.flushHeaders()` immediately. SSE routes are **excluded from
   `compression`** (filter function) and from response-size/ETag middlewares. Request timeouts are disabled per SSE route;
   the server enforces its own max duration (default 10 min for operations, 2 min idle for chat) and closes on client
   disconnect (`req.on('close')` aborts the upstream `AbortController`).
6. **Proxy notes (Databricks Apps):** the App sits behind the Databricks reverse proxy; buffering must be defeated by the
   headers above plus the early flush and heartbeats. P4 verifies streaming through the deployed App (first byte before the
   job finishes, heartbeats received at the expected cadence) and records the proxy's idle timeout; if the proxy buffers or
   cuts streams, the web falls back to polling `GET /operations/:operationId` (operations) — chat then degrades to a single
   non-streamed response.

## Alternatives considered

- **WebSockets.** Bidirectional capability is not needed; adds upgrade handling through the proxy, separate auth/CSRF story
  and a heavier client. Rejected.
- **Polling only.** Simple and proxy-proof; kept as the operations fallback, but gives poor chat UX (no token streaming,
  L296). Rejected as the primary transport.
- **Long polling.** Same proxy exposure as SSE with more complexity. Rejected.
- **`EventSource` for chat via GET with query params.** Would put the prompt in the URL (logs, history) and bypass CSRF on a
  state-changing call. Rejected; POST + fetch stream instead.

## Consequences

- Positive: one simple, HTTP/1.1-compatible mechanism for both push flows, same cookie session, typed events in the contract.
- Negative: the `compression` exclusion and header set must be covered by tests (API E2E checks `content-type`, no
  `content-encoding`, heartbeat presence) or streaming silently breaks.
- Negative: open streams hold a socket each; the per-session concurrent stream limit (default 4) is enforced to protect the
  App.
- Unknown until deployed: Databricks Apps proxy buffering and idle timeout — tracked as a P4 verification item.
- Follow-ups: operations use case + mock job progression `QUEUED → RUNNING → SUCCEEDED|FAILED` (L388), assistant SSE (F04,
  C-33).
