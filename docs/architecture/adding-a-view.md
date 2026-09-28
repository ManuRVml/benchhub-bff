# Adding a new view

This guide walks through adding a new view endpoint to the BFF. Every view is a
single HTTP endpoint that returns a single screen's data.

**Brief:** From §4.1 rule 1 and §2.6 BFF structure - endpoints by view, not by
resource.

**Today:** Enforced in `src/presentation/http/routes/mock.routes.ts` via
`CONTRACT_SCHEMAS` registry mapping each view ID to its endpoint. View composers
and aggregation are target design, not yet implemented.

## Checklist

- [ ] Contract defined in `docs/requirements/view-data-contracts.md`.
- [ ] Zod schema created with `.strict()`.
- [ ] Port created (if external service needed).
- [ ] Mock implemented.
- [ ] View composer implemented.
- [ ] Presenter implemented (whitelist projection).
- [ ] Route created with validation and tests.
- [ ] `pnpm contract:build` run, version bumped.
- [ ] `pnpm verify` passes.

## 1. Define the view contract

Create a new file `docs/requirements/view-data-contracts/V-XX-name.md` (replace
`XX` with a unique number, `name` with a descriptive name).

**Brief:** From §2.2 contract consumer-driven - BFF owns the contract, web
consumes it.

**Today:** Enforced via `pnpm contract:check` in CI; `src/contracts/` uses
`.strict()` schemas.

## 2. Create the Zod schemas

Create a new folder `src/contracts/v-xx/` with:

- `request.ts` - Zod schema for request query/body (optional).
- `response.ts` - Zod schema for response body (required).

Both files export a `z.object(...).strict()` schema.

**Brief:** From §2.2 contract validation - Zod schemas with `.strict()` as
source of truth.

**Today:** Enforced in `src/contracts/`; `pnpm contract:build` generates OpenAPI
from Zod.

## 3. Register the contract in the registry

Add your view to `src/contracts/registry.ts`:

```ts
import { z } from 'zod';
import { requestSchema, responseSchema } from './v-xx/index.js';

export const V_XX: ContractEntry = {
  id: 'V-XX',
  endpoint: { method: 'GET', path: '/api/v1/views/your-view' },
  request: requestSchema,
  response: responseSchema,
};
```

Then import and register it in the registry.

**Brief:** From §2.2 contract consumer-driven - BFF owns the contract, web
consumes it.

**Today:** Enforced - `src/contracts/registry.ts` holds all view definitions;
mock router uses this registry.

## 4. Create the view composer

Create `src/application/view-composers/your-view.view.ts`:

```ts
import type { Container } from '../../composition-root/container.js';
import type { YourViewRequest } from '../../contracts/v-xx/request.js';
import type { YourViewModel } from '../../contracts/v-xx/response.js';

export async function composeYourView(
  container: Container,
  request: YourViewRequest,
): Promise<YourViewModel> {
  // Call providers in parallel
  const [sectionA, sectionB] = await Promise.allSettled([
    container.portA(request),
    container.portB(request),
  ]);

  // Map to SectionResult
  const a = sectionA.status === 'fulfilled'
    ? { status: 'ok' as const, data: sectionA.value }
    : { status: 'error' as const, errorCode: 'PROVIDER_UNAVAILABLE' };
  const b = sectionB.status === 'fulfilled'
    ? { status: 'ok' as const, data: sectionB.value }
    : { status: 'forbidden' as const };

  // Compose response
  return {
    meta: { timestamp: new Date().toISOString() },
    sectionA: a,
    sectionB: b,
  };
}
```

**Brief:** From §4.1 rule 3 and §2.6 BFF structure - view composers in
`src/application/view-composers/`.

**Today:** Not implemented yet (mock-only BFF; target design). The mock router
directly returns contract examples without aggregation or composition.

## 5. Create the presenter

Create `src/application/view-composers/your-view.presenter.ts`:

```ts
import type { YourViewModel } from '../../contracts/v-xx/response.js';

export function presentYourView(model: YourViewModel): YourViewModel {
  // Whitelist projection: only return fields defined in the contract
  // No extra fields, no infra metadata
  return model;
}
```

**Brief:** From §4.1 rule 5 - whitelist projection, no infra identifiers
exposed.

**Today:** Partially enforced - `src/contracts/` uses `.strict()` schemas; mock
router validates against contract schemas.

## 6. Create the route

Create `src/presentation/http/routes/your-view.routes.ts`:

```ts
import { Router, type Request, type Response } from 'express';
import { composeYourView } from '../../../application/view-composers/your-view.view.js';
import { presentYourView } from '../../../application/view-composers/your-view.presenter.js';

export function createYourViewRouter(): Router {
  const router = Router();

  router.get('/api/v1/views/your-view', async (req: Request, res: Response) => {
    const container = req.app.get('container');
    const view = await composeYourView(container, req.query);
    const presenter = presentYourView(view);
    res.json(presenter);
  });

  return router;
}
```

**Brief:** From §2.6 BFF structure - routes in `src/presentation/http/routes/`.

**Today:** Enforced in `src/presentation/http/routes/mock.routes.ts` via
`CONTRACT_SCHEMAS` registry.

## 7. Wire the router in `src/main.ts`

Add the router to the list of feature routers:

```ts
import { createYourViewRouter } from './presentation/http/routes/your-view.routes.js';

app.use(createYourViewRouter());
```

**Brief:** From §2.6 BFF structure - `src/main.ts` creates the app with the
composition root.

**Today:** Enforced - `src/main.ts` registers all routers; mock router is
registered in `src/app.ts`.

## 8. Create tests

### Unit test for the composer

Create `tests/unit/your-view.view.test.ts`:

```ts
import { describe, it, expect, beforeEach, mock } from 'vitest';
import { composeYourView } from '../../src/application/view-composers/your-view.view.js';
import { buildContainer } from '../../src/composition-root/container.js';

describe('composeYourView', () => {
  let container: ReturnType<typeof buildContainer>;

  beforeEach(() => {
    container = buildContainer({ NODE_ENV: 'test' }, {});
  });

  it('returns composed view model', async () => {
    const request = {};
    const result = await composeYourView(container, request);
    expect(result).toMatchObject({
      meta: expect.anything(),
      sectionA: expect.objectContaining({ status: 'ok' }),
      sectionB: expect.objectContaining({ status: 'ok' }),
    });
  });
});
```

**Brief:** From §4.1 rule 4 - resilience policy, §4.1 rule 7 - permissions in
response.

**Today:** Partially enforced - mock routes validate against contract schemas;
SectionResult simulation not yet implemented.

### E2E test for the endpoint

Create `tests/api-e2e/your-view.routes.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../../src/app.js';
import { buildContainer } from '../../src/composition-root/container.js';

describe('GET /api/v1/views/your-view', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createApp(buildContainer({ NODE_ENV: 'test' }, {}));
  });

  it('returns 200 with view model', async () => {
    const response = await request(app).get('/api/v1/views/your-view');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      meta: expect.anything(),
      sectionA: expect.objectContaining({ status: 'ok' }),
      sectionB: expect.objectContaining({ status: 'ok' }),
    });
  });
});
```

**Brief:** From §2.2 contract validation - `.strict()` schemas validate every
response.

**Today:** Enforced - `pnpm verify` runs tests; mock routes validate against
contract schemas.

## 9. Run contract build and verify

```bash
pnpm contract:build
pnpm verify
```

The contract build should not change `contracts/openapi.yaml` (unless you added
a breaking change).
