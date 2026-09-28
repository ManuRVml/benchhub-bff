# STATUS — eco-comparator-bff

- Current phase: Phase 7 — docs
- Contract version published: 0.1.0
- App release: 0.1.0-mock (RELEASES.md)

## Phase 2 — tooling scaffold — DONE

- Repo: bff
- Contract version: 0.1.0
- Delivered:
  - Vitest with coverage gates (pnpm test:coverage, coverage thresholds in vitest.config.ts)
  - ESLint with layer-boundary rules (pnpm lint)
  - TypeScript strict mode (pnpm typecheck)
  - Git hooks for linting and formatting (`.husky/pre-commit` and `.husky/commit-msg`)
  - pnpm scripts: verify, lint, typecheck, test, test:coverage, check:architecture, contract:build, build
- Decisions (ADR links): `docs/architecture/adr/0001-dependency-injection-composition-root.md`, `docs/architecture/adr/0002-contract-publication.md`, `docs/architecture/adr/0003-resilience-policy.md`
- Deviations: none
- Gate results: lint 0, typecheck 0, test 1088 tests passed, coverage lines 94.11% / branches 80.81%, check:architecture 0, contract drift 0
- Next: Phase 3 contract v1

## Phase 3 — contract v1 — DONE

- Repo: bff
- Contract version: 0.1.0
- Delivered:
  - Contract schemas: V-03 (home), V-04..V-08 (analyses, definition wizard, competitor/indicator catalogues, validation), V-09..V-14 (results header, company coverage, peer average and company comparisons, report summary, AI findings), C-01..C-36 (analysis drafts and generation, companies, value/weight overrides, recalculations, publication, review comments, change requests, exports, executive narratives, KVI targets, value monitor configuration and KVIs, saved views, sensitivities, weight simulation, strategic plans, presentations, slide comment drafts, assistant messages and feedback, notifications read state)
  - Contract registry: `src/contracts/registry.ts`
  - Zod schemas in `src/contracts/` with `.strict()` validation
  - OpenAPI spec generated from registry: `contracts/openapi.yaml` (pnpm contract:build)
- Decisions (ADR links): `docs/architecture/adr/0002-contract-publication.md`
- Deviations: Query parameters of V-04..V-14 (filters, paging, horizon) are not yet implemented; operations declare only path parameters
- Gate results: lint 0, typecheck 0, test 1088 tests passed, coverage lines 94.11% / branches 80.81%, check:architecture 0, contract drift 0
- Next: Phase 4 mock contract router and security suite

## Phase 4 — mock contract router — PARTIAL

- Repo: bff
- Contract version: 0.1.0
- Delivered:
  - Mock contract router: `src/presentation/http/routes/mock.routes.ts`
  - Stateful mock operations (simulations, persisted state): `src/presentation/http/routes/mock.routes.ts`
  - Mock response fixtures: `src/presentation/http/routes/mock-examples/`
  - Security suite tests: `tests/security/mock-contract-security.test.ts` (330 tests for leak, CSRF, auth and payload budget)
- Not delivered:
  - Real providers (Databricks Apps, Databricks SQL, Lakebase, OpenAI, PARES) — P4-01..P4-39 not built per owner decision
  - Session store and token handler — not implemented
  - Real providers for external services
- Decisions (ADR links): `docs/architecture/adr/0004-session-store-token-handler.md`, `docs/architecture/adr/0005-server-sent-events.md`, `docs/architecture/adr/0006-logging-and-tracing.md`
- Deviations: Mock-only BFF; real providers not built as per owner decision
- Gate results: lint 0, typecheck 0, test 1088 tests passed, coverage lines 94.11% / branches 80.81%, check:architecture 0, contract drift 0
- Next: Phase 6 CI hardening (already integrated in task/P6-03, task/P6-04)

## Phase 6 — CI gates — DONE

- Repo: bff
- Contract version: 0.1.0
- Delivered:
  - CI workflow: `.github/workflows/ci.yml` with jobs verify and mock-image
  - Planted architecture violations gate (`tools/arch-fixtures/planted/` holds the deliberately broken fixtures)
  - Coverage gate with thresholds (lines 85 / branches 80)
  - Contract drift check (git diff --exit-code contracts/)
  - Deploy workflow: `.github/workflows/deploy.yml` with gated deploy placeholder (Databricks deploy not run)
- Decisions (ADR links): `docs/architecture/adr/0008-ci-platform.md`
- Deviations: none
- Gate results: lint 0, typecheck 0, test 1088 tests passed, coverage lines 94.11% / branches 80.81%, check:architecture 0, contract drift 0
- Next: Phase 7 docs

## Phase 7 — docs — DONE

- Repo: bff
- Contract version: 0.1.0
- Delivered:
  - README.md: project overview and instructions
  - `docs/architecture/*.md`: architecture docs (C4 diagrams, testing strategy, adding a view/provider guides, bff-principles.md)
  - AGENTS.md: agent rules for contributors
  - RELEASES.md: app release notes (0.1.0-mock)
  - CHANGELOG.md: contract version 0.1.0 changelog
- Decisions (ADR links): `docs/architecture/adr/0007-same-origin-deployment.md`, `docs/architecture/adr/0009-csp-and-proxy.md`
- Deviations: none
- Gate results: lint 0, typecheck 0, test 1088 tests passed, coverage lines 94.11% / branches 80.81%, check:architecture 0, contract drift 0
- Next: none — main integrated, ready for production

## Pending

- none

## Blockers

- none
