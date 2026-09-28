# BFF principles

The backend-for-frontend (`eco-comparator-bff`) is a Node.js + Express 5 service
dedicated exclusively to `eco-comparator-web`. It owns the view data contracts
and the OpenAPI specification, and serves only view-shaped endpoints.

## 1. One endpoint per view

Every HTTP endpoint is tied to exactly one web view (screen). There are no
generic CRUD endpoints, no pass-through routes, and no endpoint that serves
multiple screens.

- View endpoints are `GET` requests to `/api/v1/views/*` (or `POST` for commands
  that return a result, e.g. `POST /api/v1/operations/:operationId`).
- Commands that trigger long-running operations return `202 Accepted` with an
  `operationId`; clients poll `/api/v1/operations/:operationId` or subscribe to
  SSE at `/api/v1/operations/:operationId/events`.

**Brief:** From §4.1 rule 1 and §2.6 BFF structure - endpoints by view, not by
resource.

**Today:** Enforced in `src/presentation/http/routes/mock.routes.ts` via
`CONTRACT_SCHEMAS` registry mapping each view ID to its endpoint.

## 2. Server-side aggregation

Each view endpoint is served by a view composer that calls multiple providers in
parallel and composes one response. The view is responsible for the shape of
the data, not the providers.

- Providers are ports with at least two implementations: `mock` (for development
  and testing) and `real` (for production).
- Real adapters are wrapped with a resilience policy (timeouts, retries, circuit
  breaker) defined in the port; mocks honour the same policy for consistent
  testing.

**Brief:** From §4.1 rule 3 and §2.6 BFF structure - view composers in
`src/application/view-composers/`.

**Today:** Not implemented yet (mock-only BFF; target design). The mock router
directly returns contract examples without aggregation or composition.

## 3. Strict projection

The response body is a whitelist: only fields defined in the view contract are
returned. No provider internal identifiers, no infra metadata, no secrets.

- Every view composer returns a plain object that matches the Zod schema in
  `src/contracts/<view>/`.
- Contracts are `.strict()`; unexpected fields in provider responses cause a
  parsing error.

**Brief:** From §4.1 rule 5 - whitelist projection, no infra identifiers
exposed.

**Today:** Partially enforced - `src/contracts/` uses `.strict()` schemas; mock
router validates against contract schemas but does not do composer-level
projection.

## 4. Permissions in the response

Authorization decisions are encoded in the response, not HTTP status codes.
Every section of the response can be `ok`, `error`, or `forbidden`.

- A `SectionResult<T>` is:
  `{ status: 'ok'; data: T } | { status: 'error'; errorCode: string } | { status: 'forbidden' }`.
- The primary section failure (`error`) results in a `503` or `504` (provider
  unavailable / timeout); secondary section failures (`error` / `forbidden`)
  are surfaced in the response body without failing the whole view.

**Brief:** From §4.1 rule 7 - permissions resolved in response, not HTTP
status.

**Today:** Not implemented yet (mock-only BFF; target design). The mock router
returns fixed contract examples without permission-based section results.

## 5. SectionResult for partial degradation

If a secondary provider fails, the view still answers `200` with that section
as `error` or `forbidden`. Only the primary section failure fails the whole
view.

- View composers use `Promise.allSettled` to call providers in parallel.
- Each provider rejection is mapped to a `SectionResult` with a stable
  `errorCode`: `PROVIDER_TIMEOUT`, `PROVIDER_UNAVAILABLE`, `FORBIDDEN`,
  `INVALID_PERMISSION`, …

**Brief:** From §4.1 rule 4 - partial degradation with `SectionResult<T>`.

**Today:** Not implemented yet (mock-only BFF; target design). The mock router
does not simulate partial failures or `SectionResult` handling.

## 6. No infra identifiers

Tokens, secrets, table names, catalog names, storage paths and internal IDs
never reach the client.

- Session tokens, Entra tokens, Service Principal tokens are encrypted and
  stored server-side.
- Logs are redacted (pino `redact`) to prevent secrets from appearing in logs.
- The central error handler never returns stack traces or internal identifiers
  to the client.

**Brief:** From §4.1 rule 9 - token handler pattern, never expose tokens to
browser.

**Today:** Partially enforced - `src/presentation/http/routes/mock.routes.ts`
uses CSRF tokens and session cookies; no stack traces returned in errors.

## 7. Contract-first

The OpenAPI specification is generated from Zod schemas in `src/contracts/`.
The source of truth is the Zod schema, not a hand-written OpenAPI document.

- `pnpm contract:build` generates `contracts/openapi.yaml` from the Zod
  schemas.
- The web consumes the contract via a versioned tarball
  (`@eco/bff-contract-<x.y.z>.tgz`) pinned in `vendor/contract/`.
- CI gates: `pnpm contract:build` must not change the spec; `pnpm contract:diff`
  must not detect breaking changes without a major version bump.

**Brief:** From §2.2 contract consumer-driven - BFF owns the contract, web
consumes it.

**Today:** Enforced - `src/contracts/` defines Zod schemas; `pnpm contract:build`
generates OpenAPI; CI runs `pnpm contract:check`.

## 8. Type-safe contracts with Zod

Every contract has a Zod schema (`z.object(...).strict()`) for the request
(optional) and response. The schema is the source of truth for validation and
OpenAPI generation.

- Request validation happens before the view composer is called; the composer
  receives parsed input.
- Response validation happens after the composer returns; an unexpected field
  causes a `500` error.

**Brief:** From §2.2 contract validation - Zod schemas with `.strict()` as
source of truth.

**Today:** Enforced - `src/contracts/` uses `.strict()` schemas; validation in
`mock.routes.ts` via `safeParse()`.

## 9. Composition root for dependency injection

All concrete classes are instantiated in
`src/composition-root/container.ts`. No decorators, no reflection metadata, no
service locator.

- `Container` is a typed interface that holds ports, use cases, composers, and
  configuration.
- Tests construct a container with fake implementations
  (`buildContainer(testEnv, { port: fake })`).
- Provider selection is driven by environment variables:
  `PROVIDERS_DEFAULT=mock`, `PROVIDER_<PORT_FAMILY>=real`.

**Brief:** From §2.6 BFF structure - composition-root/container.ts is the single
instantiation point.

**Today:** Enforced - `src/composition-root/container.ts` instantiates all
services; provider selection via env vars.

## 10. Session management with token-handler pattern

The BFF completes the Entra ID login; the browser only receives a session cookie
with `HttpOnly`, `Secure`, `SameSite=Lax`. Entra tokens, Service Principal
tokens and external API tokens never reach the browser.

- Session store port with adapters: in-memory (dev/test) and Lakebase
  (production PostgreSQL).
- CSRF protection: synchronizer token in `X-CSRF-Token` header for unsafe
  methods.
- Session id is ≥ 256 bits (`crypto.randomBytes`), name `__Host-eco_sid`,
  attributes `HttpOnly; Secure; SameSite=Lax; Path=/`.

**Brief:** From §4.1 rule 9 - token handler pattern, browser only gets session
cookie.

**Today:** Partially enforced - `src/presentation/http/routes/mock.routes.ts`
uses CSRF tokens and session cookies via `eco_mock_session`.

## 11. Logging and tracing with pino

Every request gets a `traceId` that appears in structured logs, is propagated to
providers and is returned in `ApiError.traceId`.

- Logger is one root `pino` instance created in the composition root.
- `pino-http` middleware logs one line per request with `traceId`, `userId`
  (pseudonymous), status, duration and response size.
- Redaction (`pino.redact`) ensures tokens, secrets and cookies never appear in
  logs.

**Brief:** From §4.1 rule 4.1 logging requirements - structured logs with pino,
traceId propagation.

**Today:** Enforced - `src/config/logger.ts` builds the root pino logger with
redaction; `src/presentation/http/middlewares/trace-id.ts` and
`request-logger.ts` (pino-http) log every request with its traceId, which
`error-handler.ts` returns in the error body. No providers to propagate it to yet.

## 12. Resilience policy per port

Every real adapter applies timeouts, retries with backoff and a circuit breaker.
The policy is defined in the port and configured via environment variables.

- Timeouts: 5 s for reads, 10 s for commands, 30 s idle for streams
  (Warehouse reads 15 s).
- Retries only for idempotent reads: exponential backoff with full jitter, 2
  retries, on network errors, timeouts, `429` and `5xx`.
- Circuit breaker per port instance: opens after N consecutive failures inside a
  window; while open, calls fail fast with `ProviderUnavailableError`.

**Brief:** From §4.1 rule 14 and resilience requirements - timeouts, retries,
circuit breaker per port.

**Today:** Not implemented yet (mock-only BFF; target design). The mock router
simulates latency via `MOCK_LATENCY_MS` but does not apply resilience policies.

## 13. Server-Sent Events for streaming

Two features push data from server to browser: operation progress and assistant
chat. Both use SSE (`text/event-stream`), no WebSockets.

- Operation progress: `GET /api/v1/operations/:operationId/events` with events
  `progress`, `done`, `error`.
- Assistant chat: `POST /api/v1/assistant/messages` answers with SSE; events
  `token`, `citation`, `done`, `error`.
- SSE routes are excluded from `compression` middleware; heartbeats every 15 s;
  `X-Accel-Buffering: no` and `res.flushHeaders()` to defeat proxy buffering.

**Brief:** From §4.1 rules 10 and 11 - SSE for operations and assistant chat.

**Today:** Partially enforced - `mock.routes.ts` answers O-02 (operation events)
as `text/event-stream` with `X-Accel-Buffering: no`, writing one example event
and closing; no heartbeats, and assistant chat (C-33) is served as plain JSON.

## 14. Same-origin deployment

The BFF and the web are separate repositories but deployed as one Databricks
App: the BFF serves `/api/*` and the web build from `public/`.

- No CORS, first-party `SameSite=Lax` cookies, simple SSE.
- Static serving: `express.static(public/)` for hashed assets; `index.html`
  with SPA fallback for unknown paths.
- Local development: BFF on `http://localhost:3001` with
  `PROVIDERS_DEFAULT=mock`; web Vite proxy `/api → http://localhost:3001`.

**Brief:** From §2.4 deployment - same-origin via Databricks App, BFF serves
static files.

**Today:** Enforced - local development uses Vite proxy `/api → http://localhost:3001`;
mock router runs on port 3001.

## Enforcement points

- **Boundary lint** (`eslint-plugin-boundaries`, `dependency-cruiser`): only
  `composition-root` may import from `infrastructure`.
- **Contract validation**: every response is `.strict()`-parsed by Zod;
  unexpected fields cause a `500`.
- **Permission checks**: every write validates permissions server-side; audit
  log captures who did what and when.
- **Secret redaction**: unit test asserts that a log line built from a request
  with all secrets contains none of them.

## See also

- [`docs/architecture/adr/`](adr/) — Detailed architectural
  decisions for each principle.
- [`docs/architecture/adding-a-view.md`](adding-a-view.md) — How to add a new
  view endpoint.
- [`docs/architecture/adding-a-provider.md`](adding-a-provider.md) — Port/mock/
  provider pattern.
