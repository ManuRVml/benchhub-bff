# Eco-Comparador BFF Tech Stack

| Tool                              | Exact Version | Purpose                                                                  | Checked    |
| --------------------------------- | ------------- | ------------------------------------------------------------------------ | ---------- |
| Node.js                           | 24.14.1       | Runtime (LTS)                                                            | 2026-09-25 |
| pnpm                              | 11.9.0        | Package manager                                                          | 2026-09-25 |
| TypeScript                        | 7.0.2         | Strict typing, compilation                                               | 2026-09-25 |
| @types/node                       | 24.13.6       | Node.js 24 type definitions                                              | 2026-09-25 |
| tsx                               | 4.23.15       | Development server / script runner                                       | 2026-09-25 |
| tsup                              | 8.5.1         | Build tool (ESM, Node 24)                                                | 2026-09-25 |
| vitest                            | 5.0.1         | Unit & API E2E testing                                                   | 2026-09-25 |
| eslint                            | 10.11.0       | Linter (flat config, `eslint.config.js`)                                 | 2026-09-25 |
| @eslint/js                        | 10.0.1        | ESLint recommended rules                                                 | 2026-09-25 |
| typescript-eslint                 | 8.70.1        | Type-checked TS rules (`strictTypeChecked`, `projectService`)            | 2026-09-25 |
| eslint-plugin-import-x            | 4.17.1        | Import order, cycles, resolution                                         | 2026-09-25 |
| eslint-import-resolver-typescript | 4.4.5         | TS/NodeNext import resolution for import-x and boundaries                | 2026-09-25 |
| eslint-plugin-boundaries          | 7.2.0         | Layer boundaries in `pnpm lint` and the editor (brief §4.2)              | 2026-09-25 |
| eslint-plugin-n                   | 18.3.0        | Node.js rules                                                            | 2026-09-25 |
| eslint-plugin-security            | 4.0.1         | Security lint rules                                                      | 2026-09-25 |
| @vitest/eslint-plugin             | 1.6.27        | Vitest rules for `tests/**`                                              | 2026-09-25 |
| eslint-config-prettier            | 10.1.8        | Turns off rules Prettier owns                                            | 2026-09-25 |
| globals                           | 17.12.0       | Node globals for ESLint                                                  | 2026-09-25 |
| prettier                          | 3.9.9         | Formatter (`.prettierrc`)                                                | 2026-09-25 |
| dependency-cruiser                | 18.4.0        | Layer rules in CI (`pnpm check:architecture`)                            | 2026-09-25 |
| @asteasolutions/zod-to-openapi    | 9.1.0         | OpenAPI 3.1 from the Zod registry (`pnpm contract:build`, P3-02)         | 2026-09-25 |
| yaml                              | 2.9.1         | Serialises `contracts/openapi.yaml` (`pnpm contract:build`)              | 2026-09-25 |
| oasdiff (container image)         | v1.32.1       | Breaking-change gate `pnpm contract:diff` (`tufin/oasdiff:v1.32.1`)      | 2026-09-25 |
| typescript (tooling only)         | 6.0.3         | JS compiler API for typescript-eslint and dependency-cruiser (see below) | 2026-09-25 |
| @vitest/coverage-v8               | 5.0.1         | V8 coverage provider (same version as vitest)                            | 2026-09-25 |
| supertest                         | 7.3.0         | HTTP assertions for API E2E tests                                        | 2026-09-25 |
| @types/supertest                  | 7.2.1         | Type definitions for supertest                                           | 2026-09-25 |
| husky                             | 9.1.7         | Git hooks (`pre-commit`, `commit-msg`)                                   | 2026-09-25 |
| lint-staged                       | 17.5.1        | ESLint + Prettier on staged `*.ts` from the pre-commit hook              | 2026-09-25 |
| @commitlint/cli                   | 21.2.3        | Commit message linting (`commit-msg` hook)                               | 2026-09-25 |
| @commitlint/config-conventional   | 21.2.3        | Conventional Commits rule set for commitlint                             | 2026-09-25 |
| express                           | 5.2.1         | HTTP server (Express 5, brief L210)                                      | 2026-09-25 |
| zod                               | 4.6.5         | Env validation and contract schemas (`src/contracts/`); see pairing below | 2026-09-25 |
| pino                              | 10.3.1        | Structured JSON logger with redaction (ADR-0006)                         | 2026-09-25 |
| pino-http                         | 11.0.0        | Per-request logging middleware (wired in P2-B03)                         | 2026-09-25 |
| helmet                            | 8.3.0         | Security headers (wired in P2-B03)                                       | 2026-09-25 |
| compression                       | 1.8.2         | Response compression (wired in P2-B03)                                   | 2026-09-25 |
| express-rate-limit                | 8.7.0         | Rate limiting (wired in P2-B03)                                          | 2026-09-25 |
| cookie-parser                     | 1.4.7         | Session cookie parsing (wired in P2-B03 / ADR-0004)                      | 2026-09-25 |
| @types/express                    | 5.0.6         | Type definitions for Express 5                                           | 2026-09-25 |
| @types/compression                | 1.8.1         | Type definitions for compression                                         | 2026-09-25 |
| @types/cookie-parser              | 1.4.10        | Type definitions for cookie-parser                                       | 2026-09-25 |

## Runtime dependencies

Runtime packages (express … cookie-parser) are exact `dependencies`; pinned in P2-B01b from `pnpm view <pkg> version`.
`src/main.ts` binds a bare Express app; middlewares and routes arrive with `createApp(container)` in P2-B03.

## Compiler options notes

- **skipLibCheck: true** — Required because tsup 8.5.1 references optional peer `@swc/core` and `./types.cts`; rollup 4.63.4 needs `Symbol.asyncDispose` from ES2024 which tsc reports as missing in `node_modules/.pnpm/rollup@4.63.4/node_modules/rollup/dist/rollup.d.ts` when `skipLibCheck` is false. Setting it to true avoids failures inside third-party .d.ts files while still type-checking our own code.
- **types: ["node"]** — Explicitly includes Node.js built-in types in the compilation context.

## TypeScript API for tooling

typescript@7 is the native (Go) compiler and ships no classic JS compiler API, while typescript-eslint 8.70.1
requires `typescript >=4.8.4 <6.1.0` and dependency-cruiser loads `typescript` as a library to parse `.ts` files.
`.pnpmfile.cjs` therefore gives the tooling packages (`@typescript-eslint/*`, `typescript-eslint`, `ts-api-utils`,
`eslint-plugin-n`, `@vitest/eslint-plugin`, `dependency-cruiser`) their own `typescript@6.0.3` dependency instead of
the root peer. `pnpm typecheck` (tsc) keeps using typescript@7.0.2. Drop the hook once typescript-eslint supports
typescript@7.

## Lint and architecture notes

- `pnpm lint` runs `eslint .` (src, tests, tools and the config files) with `--max-warnings 0`.
  `tools/arch-fixtures/planted/**` is ignored by ESLint and excluded from `tsconfig.json`.
- Layer rules (brief §4.2) live in two places that must stay in sync: `.dependency-cruiser.cjs` (CI gate,
  `pnpm check:architecture` over `src` and `tools/arch-fixtures/valid`) and `tools/architecture/boundaries.js`
  (eslint-plugin-boundaries, applied by `pnpm lint` to `src` and the valid fixtures).
- `pnpm check:architecture:planted` runs both tools over `tools/arch-fixtures/planted`, where every `bad-*.ts`
  breaks exactly one rule. It must fail and name every planted file; if it passes, a rule stopped working.
- Prettier skips `*.md` (`.prettierignore`): on the ADRs it re-indents list continuation lines, which changes prose
  owned by the docs tasks.

## Tests, coverage and git hooks (P2-B04)

- `vitest.config.ts`: `environment: 'node'`, tests `tests/**/*.test.ts` and `src/**/*.test.ts`,
  `passWithNoTests: true`. Coverage uses the v8 provider over `src/application/**`, `src/presentation/**` and
  `src/domain/**` (brief L437) with thresholds `lines: 85` and `branches: 80`; `*.test.ts` files are excluded
  from the measured set.
- Zero measured files: while those layers hold only `.gitkeep`, the measured total is 0/0 ("Unknown%"). Vitest does
  not evaluate thresholds on an empty total, so `pnpm test:coverage` exits 0 with 85/80 unchanged and no extra config.
  The gate is live: one uncovered `.ts` file under `src/domain/` makes it exit 1 ("Coverage for lines (0%) does not
  meet global threshold (85%)"). No placeholder source file or threshold override is used.
- Scripts: `test` = `vitest run`, `test:coverage` = `vitest run --coverage`,
  `verify` = `pnpm lint && pnpm typecheck && pnpm test`, `prepare` = `husky` (sets `core.hooksPath` to `.husky/_`).
- `.husky/pre-commit` runs `pnpm exec lint-staged`, then `pnpm typecheck` once over `tsconfig.json`.
  `.husky/commit-msg` runs `pnpm exec commitlint --edit "$1"` (`commitlint.config.js` extends
  `@commitlint/config-conventional`; brief L531, L576). Hooks are plain husky 9 command files (no `_/husky.sh`).
- lint-staged (`package.json`): `*.ts` → `eslint --max-warnings 0` and `prettier --check` on the staged paths.
  `tsc` is not a lint-staged task because lint-staged appends the staged paths and `tsc --noEmit <files>` fails with
  TS5112 ("tsconfig.json is present but will not be loaded if files are specified on commandline"); that is why the
  hook runs `pnpm typecheck` itself.
- `eslint.config.js` sets `projectService.allowDefaultProject: ['vitest.config.ts']`: the config file is outside
  `tsconfig.json`'s `include` (kept as on main), so typed rules use the default project for it.

## Contract schemas: zod ↔ zod-to-openapi pairing (P3-01a)

- `zod` 4.6.5 (dependency, latest stable) is the source of truth for the HTTP contract (ADR-0002 §Decision 1).
  `@asteasolutions/zod-to-openapi` 9.1.0 (latest; added by P3-02 for `contract:build`) peers `zod ^4.0.0`, checked with
  `pnpm view @asteasolutions/zod-to-openapi peerDependencies` on 2026-09-25, so 4.6.5 sits inside its range. Bump both
  together and re-check the peer range before moving zod to a new major.
- Contract kit: `src/contracts/common/` (`ApiErrorSchema`, `pageSchema`, `sectionResult` + `sectionExamples`,
  `ActionPermissionsSchema`, brand-only ids, `UnitCodeSchema`), `src/contracts/registry.ts` (`CONTRACT_SCHEMAS`,
  `listRegistry()`, printed by `pnpm exec tsx tools/contract/list-registry.ts`) and the test helpers
  `tests/helpers/expect-strict-round-trip.ts` / `expect-section-variants.ts`. V-03 (`src/contracts/views/v-03-home.ts`)
  is the worked example every schema row copies.
- `src/contracts/**` uses no `z.any`, `z.unknown`, `.passthrough` or `.catchall`; `ApiError.details` is `z.json()`
  (any JSON value).

