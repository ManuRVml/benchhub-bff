# Architecture Decision Records — eco-comparator-bff

Each ADR records one decision with its context, alternatives and consequences. Brief line references point to
`prompt_Start_Eco.md` (the master brief, outside this repository). New ADRs take the next free number and are added to
this table; superseded ADRs keep their file and change status to `Superseded by ADR-NNNN`.

| ID | Title | Status |
|---|---|---|
| [0001](0001-dependency-injection-composition-root.md) | Dependency injection through a hand-written typed composition root | Accepted |
| [0002](0002-contract-publication.md) | Contract publication — Zod → OpenAPI 3.1, versioned tarball, vendored and pinned by the web | Accepted |
| [0003](0003-resilience-policy.md) | Resilience policy for providers and view composition | Accepted |
| [0004](0004-session-store-token-handler.md) | Session management — token-handler pattern with a pluggable session store | Accepted |
| [0005](0005-server-sent-events.md) | Server-Sent Events for operation progress and assistant streaming | Accepted |
| [0006](0006-logging-and-tracing.md) | Logging and tracing — pino, per-request traceId, redaction; OpenTelemetry deferred | Accepted |
| [0007](0007-same-origin-deployment.md) | Same-origin deployment — one Databricks App serving the pinned web build and `/api` | Accepted |
| [0008](0008-ci-platform.md) | CI platform — GitHub Actions by default, container engine via `${CONTAINER_ENGINE:-podman}` | Accepted |
| [0009](0009-csp-and-proxy.md) | Content-Security-Policy for the same-origin SPA and proxy trust behind Databricks Apps | Accepted |
