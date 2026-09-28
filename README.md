# eco-comparator-bff

Backend-for-frontend (Node.js + Express 5) dedicated to `eco-comparator-web`. Serves view-shaped endpoints and owns the OpenAPI contract.

## Packaging

The BFF can be packaged with a pinned web build for deployment.

### Build and package

```bash
# Build the web app (in eco-comparator-web repo, PowerShell)
$env:VITE_API_MODE = 'http'; pnpm build

# Package the BFF with the web dist
pnpm package:with-web --web-dist <path-to-web-dist>
```

This creates a `package/` directory containing the BFF build, web dist, and metadata.

## Requirements

View data contracts define what each screen needs. See `docs/requirements/`.

Status: bootstrap. See `docs/progress/STATUS.md`.

## Quick start

1. Install dependencies: `pnpm install --frozen-lockfile`
2. Start the dev server: `pnpm dev`
3. Open the health endpoint: <http://localhost:3001/api/v1/health>

## Mock mode

The BFF runs in mock mode by default (`PROVIDERS_DEFAULT=mock`). Configure mock behavior with environment variables:

| Variable | Values | Description |
| -------- | ------ | ----------- |
| `PROVIDERS_DEFAULT` | `mock` | Default provider for all services |
| `MOCK_SCENARIO` | `default`, `empty`, `error`, `slow`, `partial`, `forbidden` | Simulated response scenario |
| `MOCK_LATENCY_MS` | number | Artificial delay in ms |
| `MOCK_ROLE` | `analyst_creator`, `explorer_viewer`, `explorer_integral`, `executive_viewer`, `executive_integral` | Simulated user role |
| `MOCK_LOGIN_USERNAME` | e-mail, at most 254 characters (default `ecopetrol@ecopetrol.com`) | Username the A-05 password login accepts (case-insensitive, trimmed) |
| `MOCK_LOGIN_PASSWORD` | 1..128 characters (default `ecopetrol`) | Password the A-05 password login accepts (exact, constant-time, never logged) |
| `RATE_LIMIT_PER_MINUTE` | positive integer (default `300`) | Requests per minute per client IP; production keeps 300, the local web stack raises it |

Sign in to the mock with `POST /api/v1/auth/password-login` (A-05) and the pair above, or through the A-01 → A-02
redirect flow, which needs no credentials. Both set the `eco_mock_session` cookie; the CSRF token is in A-04 (and in
the A-05 body). The password login is mock-only: production auth is Entra ID / OIDC (A-01/A-02).

## Container image

Build the mock image:

```bash
pnpm image:build:mock
```

Run the mock container:

```bash
podman run --rm -p 3001:3001 -e PROVIDERS_DEFAULT=mock eco-comparator-bff:local-mock
```

## Documentation

- [`docs/architecture/bff-principles.md`](docs/architecture/bff-principles.md) — BFF rules and enforcement points
- [`docs/architecture/adding-a-view.md`](docs/architecture/adding-a-view.md) — How to add a new view endpoint
- [`docs/architecture/adding-a-provider.md`](docs/architecture/adding-a-provider.md) — Port/mock/provider pattern
- [`docs/architecture/c4-context.md`](docs/architecture/c4-context.md) — C4 system context diagram
- [`docs/architecture/c4-containers.md`](docs/architecture/c4-containers.md) — C4 containers diagram
- [`docs/architecture/testing.md`](docs/architecture/testing.md) — Testing strategy and coverage
- [`docs/architecture/adr/`](docs/architecture/adr/) — Architecture decisions
- [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md) — Technology choices
- [`docs/architecture/contract-workflow.md`](docs/architecture/contract-workflow.md) — Contract generation and versioning

## pnpm scripts

| Script | Description |
| ------ | ----------- |
| `pnpm verify` | Run lint, typecheck and tests |
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Build production bundle |
| `pnpm contract:build` | Generate OpenAPI spec from Zod schemas |
| `pnpm contract:pack` | Pack contract tarball for web consumption |

## Versioned mock image

A versioned mock image is available for web E2E testing without a real backend. Build and run with:

```bash
# Build
podman build --target mock -t eco-comparator-bff:0.1.0-mock .

# Run
podman run --rm -p 127.0.0.1:3001:3001 eco-comparator-bff:0.1.0-mock
```

For Docker, replace `podman` with `docker`. The container exposes port `3001` (defined in the Dockerfile `EXPOSE` and `PORT` env).

See `RELEASES.md` for full release notes.
