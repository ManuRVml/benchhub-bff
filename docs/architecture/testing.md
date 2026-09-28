# Testing

The BFF uses Vitest for unit, port contract, and E2E tests. Coverage thresholds are enforced.

## Test layers

| Layer | Folder | What it tests | Example file |
| --- | --- | --- | --- |
| Unit | `tests/unit/` | Domain logic, utilities, helpers | `tests/unit/contracts/v-03-home.test.ts` |
| API E2E | `tests/api-e2e/` | HTTP endpoints, middleware, error handling | `tests/api-e2e/health.e2e.test.ts` |
| Contract | `tests/contract/` | OpenAPI spec, schema validation, contract examples | `tests/contract/fixtures/breaking.openapi.yaml` |
| Port contracts | `tests/port-contracts/` | Port interface contracts (placeholder, not yet populated) | `tests/port-contracts/.gitkeep` |
| Security | `tests/security/` | Security tests (placeholder, folder exists only as `.gitkeep`) | `tests/security/.gitkeep` |

## Machine rule

All tests run sequentially to ensure deterministic behavior:

```bash
vitest run --maxWorkers=1 --no-file-parallelism
```

## Coverage thresholds

`vitest.config.ts` enforces coverage thresholds:

- Lines: 85%
- Branches: 80%

```typescript
coverage: {
  provider: 'v8',
  include: ['src/application/**/*.ts', 'src/presentation/**/*.ts', 'src/domain/**/*.ts'],
  exclude: ['**/*.test.ts'],
  thresholds: {
    lines: 85,
    branches: 80,
  },
},
```

Note: `pnpm test:coverage` must exit 0 on this tree even though `src/` has no `.ts` files yet.
Thresholds are checked only when coverage data exists.

## Architecture checks

Two architecture validation scripts:

1. **`pnpm check:architecture`** — Dependency Cruiser validates layer boundaries:
   - `src/` must follow the layer hierarchy
   - `tools/` contains architecture fixtures for valid and planted scenarios
   - Configuration: `.dependency-cruiser.cjs`

2. **`pnpm check:architecture:planted`** — Verifies architecture fixtures are correctly planted:
   - `tools/arch-fixtures/valid/` — Valid layer structures
   - `tools/arch-fixtures/planted/` — Invalid layer structures that should fail lint

## pnpm verify

`pnpm verify` runs the complete validation pipeline:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

| Script | Description |
| --- | --- |
| `pnpm lint` | ESLint with `--max-warnings 0` |
| `pnpm typecheck` | TypeScript compiler with `noEmit` |
| `pnpm test` | Vitest unit + port contract tests |

## Mutation discipline

Every change must prove its tests fail on a named mutation:

1. Introduce a mutation (e.g., change a condition, invert a boolean, modify an error code)
2. Run `pnpm test` — it must fail with a clear error
3. Revert the mutation
4. Run `pnpm test` — it must pass
5. Commit both the change and its test fix together

Example: Changing `responseStatus(id)` to return `200` for all IDs must fail tests that expect
`201`, `202`, or `204` for specific contract IDs.
