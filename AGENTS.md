# AGENTS.md — Agent rules for eco-comparator-bff

> **Project:** Eco-Comparador — Financial Comparator for Ecopetrol  
> **Role:** BFF Node.js/Express (dedicated exclusively to this frontend)  
> **Repository:** eco-comparator-bff  
> **Language:** TypeScript strict, 100% English (code, commits, comments)

---

## 1. Read before touching any code

1. `docs/progress/STATUS.md` — current state of the project.
2. This file — agent rules.
3. Relevant ADRs in `docs/architecture/adr/`.
4. View-data contracts in `docs/requirements/view-data-contracts.md`.

Never edit `docs/progress/STATUS.md` — that is the orchestrator's responsibility.

---

## 2. Run `pnpm verify` before finishing

Never deliver with lint, types or tests in red.

```bash
pnpm verify
```

This runs: `pnpm lint && pnpm typecheck && pnpm test`.

---

## 3. Respect architecture boundaries

If the architecture linter fails, fix the design, not the rule. Run:

```bash
pnpm check:architecture
```

---

## 4. Never use `any`, `@ts-ignore` or `eslint-disable` without justification

Link to the ADR or issue that justifies the exception.

---

## 5. Every new code has tests

Unit tests for domain logic, port contract tests for external services, and E2E tests for endpoints.

---

## 6. Never import code from the web repo

The only boundary is the published contract. The BFF knows all external services; the web knows only the contract.

---

## 7. Small commits with Conventional Commits

Update `STATUS.md` and create ADRs for design decisions.

---

## 8. Know where a file goes and when it is done

Use the decision tree in [Folder structure](#folder-structure) and the [Definition of Done](#definition-of-done) below.

---

## 9-15. Web-only rules (do not apply to BFF)

---

## 16. BFF-specific rules (see [bff-principles.md](docs/architecture/bff-principles.md))

1. Apply the 14 rules of `bff-principles.md`.
2. No generic endpoints or direct pass-through.
3. No endpoint exists before its view-data contract is defined and reviewed.

---

## 17. New view data request

Follow this pipeline:

1. Define the required data in `docs/requirements/view-data-contracts.md`.
2. Create a Zod `.strict()` schema in `src/contracts/`.
3. Create the port interface (if needed).
4. Implement the mock (mocking the external service).
5. Implement the view composer.
6. Implement the presenter (whitelist projection).
7. Create the route and tests.
8. Run `pnpm contract:build` and bump the SemVer version.

---

## 18. New external service

1. Create the port interface.
2. Implement the mock.
3. Create the stub for the real service.
4. Register in `container.ts`.
5. Write the port contract test.

---

## 19. Never expose secrets

No tokens, secrets, table names, catalog names, storage paths or internal IDs reach the client.

---

## 20. All writes validate permission and are audited

Server-side permission checks before any write, with full audit logging.

---

## Folder structure

```plaintext
src/
├── application/
│   ├── use-cases/                  ← business logic (use cases)
│   └── view-composers/             ← view data composition
├── composition-root/               ← dependency injection setup
├── config/                         ← configuration modules
├── contracts/                      ← Zod schemas (strict)
├── domain/                         ← domain entities, value objects, rules
├── infrastructure/                 ← infrastructure concerns
│   └── providers/                  ← external service implementations
├── presentation/
│   ├── http/
│   │   ├── routes/                 ← HTTP endpoints
│   │   └── middlewares/            ← Express middlewares
└── ports/                          ← external service interfaces (SOLID DIP)

tests/
├── unit/                           ← domain logic tests
├── api-e2e/                        ← HTTP endpoint tests
├── contract/                       ← contract tests (zod-to-openapi)
├── contract-examples/              ← contract example validations
├── port-contracts/                 ← port interface contract tests
├── oracles/                        ← test data oracles
└── helpers/                        ← test utilities

tools/
├── architecture/                   ← architecture validation scripts
└── contract/                       ← contract generation tools

docs/
├── requirements/
│   ├── view-data-contracts.md      ← view requirements
│   └── view-data-contracts/V-*.md  ← per-view contracts
├── architecture/
│   ├── adr/                        ← architecture decision records
│   ├── testing.md                  ← testing strategy
│   ├── bff-principles.md           ← BFF design principles
│   ├── adding-a-view.md            ← adding a new view guide
│   ├── adding-a-provider.md        ← adding a new provider guide
│   ├── c4-context.md               ← C4 context diagram
│   └── c4-containers.md            ← C4 containers diagram
└── progress/
    └── STATUS.md                   ← project status (orchestrator only)
```

### Decision tree: where does this file go?

| Question | Location |
| - | - |
| New view data requirement? | `docs/requirements/view-data-contracts.md` |
| New Zod schema (request/response)? | `src/contracts/` |
| New external service interface? | `src/ports/` |
| New external service implementation? | `src/infrastructure/providers/` |
| New view composer/presenter? | `src/application/view-composers/` |
| New business logic (use case)? | `src/application/use-cases/` |
| New domain entity/value object/rule? | `src/domain/` |
| New HTTP endpoint? | `src/presentation/http/routes/` |
| New middleware? | `src/presentation/http/middlewares/` |
| New configuration? | `src/config/` |
| New composition root registration? | `src/composition-root/container.ts` |

---

## Definition of Done

### All changes

- [ ] Commit on a task branch (`task/<task-id>`)
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm check:architecture` passes
- [ ] `pnpm check:architecture:planted` passes
- [ ] `pnpm test:coverage` passes (if coverage gates apply)
- [ ] `pnpm contract:build` + `git diff contracts/` shows expected changes (if contract modified)
- [ ] A new test or mutation proves the change
- [ ] English and lower-case Conventional Commits only
- [ ] `vitest --maxWorkers=1 --no-file-parallelism` for deterministic test runs

### View endpoint

- [ ] Contract defined in `docs/requirements/view-data-contracts.md`
- [ ] Zod schema created with `.strict()` in `src/contracts/`
- [ ] Port created (if external service needed) in `src/ports/`
- [ ] Mock implemented in `src/infrastructure/providers/`
- [ ] View composer implemented in `src/application/view-composers/`
- [ ] Route created in `src/presentation/http/routes/` with validation and tests
- [ ] `pnpm contract:build` run, version bumped

### Command

- [ ] Command logic implemented in `src/application/use-cases/`
- [ ] Unit tests written in `tests/unit/`
- [ ] Port contract test written in `tests/port-contracts/` (if external service)
- [ ] `pnpm verify` passes

### Port/Provider

- [ ] Port interface defined in `src/ports/`
- [ ] Mock implemented in `src/infrastructure/providers/`
- [ ] Port contract test written in `tests/port-contracts/`
- [ ] `pnpm verify` passes

### Docs

- [ ] ADR written for design decisions in `docs/architecture/adr/`
- [ ] `STATUS.md` updated (orchestrator only)
- [ ] `AGENTS.md` updated if rules change

---

## Relevant docs

- `docs/requirements/view-data-contracts.md` — view requirements and contracts
- `docs/architecture/adr/README.md` — architecture decisions
- `docs/architecture/testing.md` — testing strategy
- `docs/architecture/bff-principles.md` — BFF design principles
- `docs/architecture/adding-a-view.md` — adding a new view guide
- `docs/architecture/adding-a-provider.md` — adding a new provider guide
- `docs/architecture/c4-context.md` — C4 context diagram
- `docs/architecture/c4-containers.md` — C4 containers diagram
- `docs/progress/STATUS.md` — current project state (orchestrator only)

---

## pnpm scripts

| Script | Description |
| - | - |
| `pnpm verify` | lint + typecheck + test |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm typecheck` | TypeScript compiler |
| `pnpm test` | Vitest unit + port contract tests |
| `pnpm test:coverage` | Vitest with coverage report |
| `pnpm check:architecture` | Dependency cruiser architecture rules |
| `pnpm check:architecture:planted` | Verify planted architecture rules |
| `pnpm contract:build` | Generate OpenAPI spec and bump version |
| `pnpm contract:diff` | Show contract changes |
| `pnpm contract:pack` | Pack contract for distribution |

---

**Last updated:** 2026-09-27 (P7-04-bff)

> **Note:** The BFF is mock-only today (the mock contract router in `src/presentation/http/routes/mock.routes.ts`). The target design is described in `docs/architecture/bff-principles.md`.
