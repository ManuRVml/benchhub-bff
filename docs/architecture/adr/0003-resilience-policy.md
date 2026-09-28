# ADR-0003: Resilience policy for providers and view composition

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L286–289 (view endpoints, server-side aggregation with `Promise.allSettled`,
  partial degradation), L278 (`SectionResult<T>`), L381 (timeouts, retries with backoff and circuit breaker defined in the
  port as a configurable policy), L387 (`MOCK_LATENCY_MS`, `MOCK_SCENARIO`), L295 (long operations → 202 + `operationId`).

## Context

Each view endpoint is served by a view composer that calls several providers in parallel and composes one response
(L288). If a section fails or is not authorised, the view still answers `200`, with that section as `SectionResult`
`error`/`forbidden`; the whole view fails only when its primary data fails (L289). Every real adapter must apply timeouts,
retries with backoff and a circuit breaker, "defined in the port as a configurable policy" (L381). Downstream services have
very different profiles: SQL Warehouse (cold-start seconds), Lakebase (transactional, fast), Model Serving (streaming, long),
Jobs (async, polled), external HTTP APIs (rate-limited). Mocks must be able to reproduce slow, empty, error, partial and
forbidden behaviour (L387) so that every UI state is exercised.

## Decision

1. **Policy per port, configurable.** Each port declares a default `ResiliencePolicy`:
   `{ timeoutMs, retry: { maxAttempts, baseDelayMs, maxDelayMs } | null, breaker: { failureThreshold, windowMs, halfOpenAfterMs } | null }`.
   Env overrides per port family (`RESILIENCE_<PORT_FAMILY>_TIMEOUT_MS`, `…_RETRY_MAX_ATTEMPTS`, `…_BREAKER_THRESHOLD`) are
   parsed in `config/env.ts`; the composition root wraps each real adapter with the policy (decorator), so adapters and use
   cases stay policy-free.
2. **Timeouts** always apply, via `AbortSignal.timeout()` passed down to the HTTP/DB client. Defaults: 5 s for reads, 10 s for
   commands, 30 s idle for streams; Warehouse reads 15 s (cold start) [defaults tunable per port].
3. **Retries only for idempotent reads.** Exponential backoff with full jitter (`delay = random(0, min(maxDelay, base·2^n))`),
   default 2 retries, only on network errors, timeouts, `429` (honouring `Retry-After`) and `5xx`. Commands (writes, job
   triggers) are **never** retried by the policy; they rely on idempotency keys at the use-case level when retry is needed.
4. **Circuit breaker per port instance** (closed → open → half-open), opening after N consecutive failures inside the window;
   while open, calls fail fast with a domain `ProviderUnavailableError` (no downstream call). State is in-process (one App
   instance); it is logged on every transition.
5. **Composition.** View composers call providers with `Promise.allSettled`. Each section maps to `SectionResult`:
   fulfilled → `ok`; `ForbiddenError` → `forbidden`; any other rejection → `error` with a stable `errorCode`
   (`PROVIDER_TIMEOUT`, `PROVIDER_UNAVAILABLE`, …). If the view's primary section fails, the composer throws and the error
   handler answers with `ApiError` (`503` for provider unavailability, `504` for timeouts).
6. **Long operations** are not retried synchronously: they return `202 { operationId }` (L295) and progress via polling or SSE
   (ADR-0005).
7. **Mocks honour the same surface.** The mock kit decorates every mock with `MOCK_LATENCY_MS` (added delay) and
   `MOCK_SCENARIO=default|empty|error|slow|partial|forbidden` (L387): `error` throws a provider error, `slow` exceeds the port
   timeout, `partial` fails a deterministic subset of secondary sections, `forbidden` throws `ForbiddenError`. Mocks run under
   the same policy wrapper, so timeouts and `SectionResult` mapping are tested against mocks.

## Alternatives considered

- **Library-based policies (cockatiel, opossum).** Cockatiel covers all three primitives with good typing; opossum is
  breaker-only. Both are acceptable implementations of this ADR; the choice is left to P4 (a ~150-line in-house wrapper is
  also acceptable). What is decided here is the policy model, placement and defaults, not the library.
- **Retry everything.** Retrying writes or job triggers risks duplicated comments, change requests or recalculations.
  Rejected.
- **Fail the whole view on any section failure.** Contradicts L289. Rejected.
- **Policies inside each adapter.** Duplicates logic and makes the mock/real behaviour diverge. Rejected in favour of a
  decorator applied in the composition root (ADR-0001).
- **Service mesh / gateway retries.** Not available inside a Databricks App. Rejected.

## Consequences

- Positive: one resilience model for every port; the UI's partial/error/forbidden states are reproducible with env vars.
- Positive: a failing secondary provider degrades a section instead of the screen.
- Negative: breaker state is per process; if the App scales to several instances they trip independently (acceptable for v1).
- Negative: timeouts must be propagated through every adapter (AbortSignal plumbing).
- Follow-ups: P4-02 (mock kit scenarios and latency), P4-06 (policy wrapper in the container), composer tests for the
  `SectionResult` mapping.
