# ADR-0001: Dependency injection through a hand-written typed composition root

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L213 (DI row of the stack table), L236–262 (repository layout, incl. L254
  `composition-root/container.ts` "único lugar con clases concretas"), L301–308 (layer rules, L307), L360–380 (§4.4 provider tree and
  selection). Plan input: `.plan/source-map/10-synthesis.md` L1159 (microtask P4-06).

## Context

The BFF is layered (`presentation → application → domain`, `infrastructure` implements `ports`, brief L301–308) and every
external service is consumed through a small port with at least two implementations: a mock and a real adapter (brief
L363–380). All real adapters start as typed stubs that throw `NotImplementedError`. Somebody has to decide which concrete
class backs each port, and the brief restricts that knowledge to one file: `src/composition-root/container.ts` (L254, L307).

The brief leaves the mechanism open — "composition root manual tipado (preferido) o `awilix` (ADR)" (L213) — and requires the
choice of provider to be driven by environment variables: `PROVIDERS_DEFAULT=mock` plus per-port overrides such as
`PROVIDER_SQL_WAREHOUSE=real` (L379). Microtask P4-06 turns this into an acceptance test: switching one provider env var
must swap only that binding (synthesis L1159).

Forces:

- TypeScript strict with zero `any` (brief L12, L206): wiring errors should be compile errors, not runtime lookups.
- `createApp(container)` must be testable without a port (brief L252), so tests need to build a container with fakes.
- The graph is small and static: ~13 service families (brief L363–376), a few dozen ports, one composer per view.
- Boundary lint (`eslint-plugin-boundaries` / `dependency-cruiser`, brief L308) must be able to assert that only
  `composition-root` imports from `infrastructure`.

## Decision

1. **No DI container library.** `src/composition-root/container.ts` is plain TypeScript: it reads the validated config
   (`src/config/env.ts`, Zod, fail fast), instantiates adapters, then use cases and view composers, and returns a typed
   `Container` object. Constructor injection everywhere; no decorators, no reflection metadata, no service locator.
2. **Shape.** `Container` is an interface split by layer, e.g. `{ config, logger, ports: Ports, useCases: UseCases,
   composers: ViewComposers }`. `Ports` has one property per port interface (`peerRankingQuery: PeerRankingQuery`, …).
   `createApp(container: Container): Express` receives it; `main.ts` is the only caller of `buildContainer(env)`.
3. **Provider selection.** Each port family has a factory map `{ mock: () => new MockX(...), real: () => new DatabricksX(...) }`.
   The selector resolves `PROVIDER_<PORT_FAMILY>` (e.g. `PROVIDER_SQL_WAREHOUSE`, `PROVIDER_LAKEBASE`,
   `PROVIDER_MODEL_SERVING`) and falls back to `PROVIDERS_DEFAULT` (default `mock`). Allowed values are a Zod enum per family
   (`mock | real`, or `mock | databricks | azure-foundry` for model serving); an unknown value fails at start-up.
4. **Lifetimes.** Everything built in the container is a process singleton. Per-request data (user, `traceId`, CSRF state)
   travels as explicit arguments or through the request object, never through a request-scoped container.
5. **Test override.** `buildContainer(env, overrides?: Partial<Ports>)` lets unit and API-E2E tests replace single ports
   without touching env vars.
6. **Enforcement.** Boundary rules (P2-B02) forbid importing `infrastructure/**` from anywhere except `composition-root/**`.

## Alternatives considered

- **awilix** (named in L213). Mature and small, but resolution is by string/camelCase name at runtime; a missing or
  misspelled registration is found when a request hits it, not by `tsc`. Its typed wrappers still need a cradle interface we
  would write by hand anyway, and the automatic lifetime management (scoped/transient) solves a problem this BFF does not
  have. Rejected: adds a dependency and indirection for no type-safety gain.
- **tsyringe / InversifyJS.** Decorator + `reflect-metadata` based; requires `experimentalDecorators`/`emitDecoratorMetadata`,
  couples domain/application classes to the container through decorators (violates "domain knows nothing external", L305).
  Rejected.
- **Module-level singletons** (`export const peerRankingQuery = new X()` imported where needed). Simplest, but every layer
  would import concrete classes, breaking L307, and tests would need module mocking. Rejected.
- **Selecting providers inside each adapter** (adapter reads its own env var). Spreads configuration; switching one binding
  could not be asserted in one place (P4-06 acceptance). Rejected.

## Consequences

- Positive: wiring mistakes are compile errors; the full dependency graph is readable in one file; swapping a provider is an
  env-var change with a single, testable decision point; zero runtime dependency.
- Positive: tests construct containers directly (`buildContainer(testEnv, { peerRankingQuery: fake })`).
- Negative: `container.ts` grows with every port and composer. Mitigation: split into `composition-root/ports.ts`,
  `use-cases.ts`, `composers.ts` helpers that `container.ts` assembles; still inside `composition-root/`.
- Negative: no automatic disposal. Adapters that hold resources (DB pool, HTTP agents) expose `close()`, and `main.ts`
  calls them on `SIGTERM`.
- Follow-ups: P2-B03 (env schema with `PROVIDERS_DEFAULT` / `PROVIDER_*`), P4-06 (factory maps + swap test), P2-B02
  (boundary rule).
