# Eco-Comparador BFF Release Notes

This file documents application releases (not the HTTP contract). The contract changelog is `CHANGELOG.md`.

## 0.1.0-mock — 2026-09-27

This is the first **mock image** release for the Eco-Comparador BFF.

### What the image is

A BFF serving every registry operation from the **mock contract router** (`src/presentation/http/routes/mock.routes.ts`) with its examples. The mock router reads response fixtures from `./mock-examples/` (copied into the container at build time) and returns them with the appropriate status codes and delays.

- C-33 streams CF-111 assistant SSE events; contract 0.2.0 documents that event union (`C33Response`).
- A-05 password login (owner decision 2026-09-28): one hard-coded credential pair, mock only (see below).

### Environment variables

| Variable        | Allowed values                               | Source                              |
|-----------------|----------------------------------------------|-------------------------------------|
| `MOCK_SCENARIO` | `default`, `empty`, `error`, `slow`, `partial`, `forbidden` | `src/config/env.ts` line 26         |
| `MOCK_ROLE`     | `analyst_creator`, `explorer_viewer`, `explorer_integral`, `executive_viewer`, `executive_integral` (default `analyst_creator`) | `src/config/env.ts` line 29 |
| `MOCK_LATENCY_MS` | `0` or positive integer | `src/config/env.ts` line 38 |
| `MOCK_LOGIN_USERNAME` | e-mail, at most 254 characters (default `ecopetrol@ecopetrol.com`) | `src/config/env.ts` line 45 |
| `MOCK_LOGIN_PASSWORD` | 1..128 characters (default `ecopetrol`) | `src/config/env.ts` line 51 |
| `RATE_LIMIT_PER_MINUTE` | positive integer (default `300`, requests per minute per client IP) | `src/config/env.ts` line 58 |

### Mock credentials

| Field    | Default                   | Rule                                                        |
|----------|---------------------------|-------------------------------------------------------------|
| Username | `ecopetrol@ecopetrol.com` | `MOCK_LOGIN_USERNAME`; compared case-insensitively after trim |
| Password | `ecopetrol`               | `MOCK_LOGIN_PASSWORD`; compared exactly in constant time, redacted from logs |

`POST /api/v1/auth/password-login` (A-05) with `{ "username", "password" }` answers 200 with the A-04 session and sets
the session cookie; a wrong password or an unknown user answers the same 401 `INVALID_CREDENTIALS`; a malformed body
answers 400. It needs no session and no CSRF token. These credentials exist only in the mock: production auth is
Entra ID / OIDC (A-01/A-02).

### Session and CSRF

| Name           | Value                | Source                                              |
|----------------|----------------------|-----------------------------------------------------|
| Session cookie | `eco_mock_session`   | `src/presentation/http/routes/mock.routes.ts` line 11 |
| CSRF header    | `x-csrf-token`       | `src/presentation/http/routes/mock.routes.ts` line 12 |

### Health endpoint

- Path: `/api/v1/health`
- Status: `200 OK` with `{ "status": "ok", "version": "0.1.0" }`; readiness is `/api/v1/ready`, which reports `degraded` until real providers exist
- Served by `src/presentation/http/routes/health.routes.ts`, not by the mock router, and needs no session

### Contract version

- Contract: `@eco/bff-contract` version **0.2.0** (the image serves the current registry)
- Changelog: `CHANGELOG.md` (line 9)
- Operations covered: 98 (A-01..A-05, V-01..V-47, C-01..C-41, O-01..O-05)

### Not included

The following are **not included** in this mock image and require Phase 4 implementation (P4-01..P4-39):

- Real providers (Databricks Apps, Databricks SQL, Lakebase, OpenAI, PARES)
- Databricks deploy pipeline

### Build and run

```bash
podman build --target mock -t eco-comparator-bff:0.1.0-mock .
podman run --rm -p 127.0.0.1:3001:3001 eco-comparator-bff:0.1.0-mock
```

See `README.md` for full instructions.
