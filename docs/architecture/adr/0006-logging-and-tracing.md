# ADR-0006: Logging and tracing — pino, per-request traceId, redaction; OpenTelemetry deferred

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L214 (`pino` + `pino-http`, OpenTelemetry optional (ADR)), L278 (`ApiError { code;
  message; traceId; details? }`), L421–428 (§4.7 cross-cutting: `traceId` on every request, structured logs and propagation
  to providers; central error handler, never stack traces to the client; audit of writes), L294 (tokens never leave the BFF),
  L536 (ESLint: no `console`, use the logger).

## Context

Every request needs a `traceId` that appears in structured logs, is propagated to providers and is returned in
`ApiError.traceId` so that a user-visible error can be matched to server logs (L278, L423). The logger is fixed by the brief:
`pino` + `pino-http` (L214). OpenTelemetry is optional and needs an ADR (L214). The BFF handles session cookies, CSRF tokens,
Entra tokens and Service Principal tokens (ADR-0004), none of which may appear in logs. `console` is banned by lint (L536).

## Decision

1. **Logger:** one root `pino` instance created in the composition root (ADR-0001) and injected (`Logger` port-like
   interface); JSON to stdout (Databricks Apps collects stdout); level from `LOG_LEVEL` (default `info`, `debug` in dev);
   `pino-pretty` only as a dev transport, never in production.
2. **HTTP logging:** `pino-http` middleware, one completion line per request with method, route template (not the raw URL
   with ids when avoidable), status, duration, `traceId`, `userId` (pseudonymous id, never e-mail/name) and response size.
   Health/ready probes logged at `debug`.
3. **traceId:** generated per request as a W3C trace-context compatible 32-hex id; if the request carries a valid
   `traceparent` header it is reused. Exposed as `req.log` child bindings, echoed in the `X-Trace-Id` response header and in
   every `ApiError.traceId`. Propagated to providers explicitly (`ctx.traceId` argument) and forwarded as `traceparent` on
   outgoing HTTP calls.
4. **Redaction (pino `redact` with censor `[REDACTED]`):** `req.headers.cookie`, `req.headers.authorization`,
   `req.headers["x-csrf-token"]`, `res.headers["set-cookie"]`, and any `*.accessToken`, `*.refreshToken`, `*.idToken`,
   `*.clientSecret`, `*.password`, `*.token`, `*.code_verifier`, `*.code`. Request/response bodies are not logged by default.
   A unit test asserts that a log line built from a request with all of them contains none of the values.
5. **Errors:** the central error handler logs the error with stack and `traceId` at `error` (5xx) or `warn` (4xx domain
   errors) and returns `ApiError` without stack or internal identifiers (L424, L287).
6. **OpenTelemetry: deferred behind a flag.** `OTEL_ENABLED=false` by default; when a collector exists, enabling it registers
   the Node SDK with HTTP/Express auto-instrumentation and uses the same `traceId` (W3C), so logs and spans correlate. No OTel
   packages are required at runtime while the flag is off (lazy import).

## Alternatives considered

- **winston / bunyan.** Not the brief's choice (L214); pino is faster and has first-class redaction. Rejected.
- **OpenTelemetry from day one.** No collector/exporter target is defined in Databricks Apps yet; adds dependencies and
  start-up cost with no consumer. Deferred, with W3C-compatible ids so adoption later needs no id migration.
- **AsyncLocalStorage for implicit traceId propagation.** Convenient, but hides a dependency the port contracts should make
  explicit and complicates tests; allowed only inside the logger binding (`req.log`), not as the providers' source of
  `traceId`. Rejected as the primary mechanism.
- **Logging request bodies for debugging.** Risk of leaking financial data and tokens. Rejected (opt-in per route at `debug`
  only, with redaction).

## Consequences

- Positive: any user-reported error (`traceId` shown or copied from `ApiError`) is searchable in the App logs.
- Positive: secrets are redacted by construction and tested.
- Negative: explicit `ctx` plumbing through composers and providers.
- Negative: without OTel there is no distributed timing view; durations are only in log lines until the flag is turned on.
- Follow-ups: P2-B03 (`LOG_LEVEL`, `OTEL_ENABLED` in env schema), error handler and redaction test in P4.
