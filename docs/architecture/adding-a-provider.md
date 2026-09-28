# Adding a new provider

This guide walks through adding a new external service (provider) to the BFF.
Every provider is accessed through a port with at least two implementations:
`mock` (for development and testing) and `real` (for production).

**Brief:** From §4.1 rules 2, 6, 12, 13 and §2.6 BFF structure - ports,
providers, providers.

**Today:** Partially implemented - mock providers exist in `src/infrastructure/providers/`;
real adapters use `NotImplementedError` stubs. Resilience policies not
yet applied.

## Checklist

- [ ] Port interface defined.
- [ ] Mock implemented.
- [ ] Port contract test written.
- [ ] `pnpm verify` passes.

## 1. Define the port interface

Create `src/ports/my-service.port.ts`:

```ts
import type { z } from 'zod';
import type { MyServiceRequestSchema } from '../contracts/my-service/request.js';
import type { MyServiceResponseSchema } from '../contracts/my-service/response.js';

export interface MyServicePort {
  execute(
    request: z.infer<typeof MyServiceRequestSchema>,
  ): Promise<z.infer<typeof MyServiceResponseSchema>>;
}
```

**Brief:** From §2.6 BFF structure - ports in `src/ports/` define external
service interfaces.

**Today:** Partially implemented - mock providers exist; port definitions in
`src/ports/` follow the pattern.

## 2. Implement the mock adapter

Create `src/infrastructure/providers/my-service.mock.ts`:

```ts
import type { MyServicePort } from '../../ports/my-service.port.js';
import type { z } from 'zod';
import type { MyServiceRequestSchema } from '../../contracts/my-service/request.js';
import type { MyServiceResponseSchema } from '../../contracts/my-service/response.js';

export class MyServiceMock implements MyServicePort {
  private readonly config: {
    MOCK_LATENCY_MS: number;
    MOCK_SCENARIO: string;
  };

  constructor(config: {
    MOCK_LATENCY_MS: number;
    MOCK_SCENARIO: string;
  }) {
    this.config = config;
  }

  async execute(
    request: z.infer<typeof MyServiceRequestSchema>,
  ): Promise<z.infer<typeof MyServiceResponseSchema>> {
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.MOCK_LATENCY_MS),
    );

    if (this.config.MOCK_SCENARIO === 'error') {
      throw new Error('Simulated error');
    }

    if (this.config.MOCK_SCENARIO === 'slow') {
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    // Return mock response matching the contract
    return {
      // fields matching MyServiceResponseSchema
    };
  }
}
```

**Brief:** From §4.1 rule 2 - no generic endpoints, §4.1 rule 6 - derivations
in BFF.

**Today:** Partially implemented - mock providers exist; mocks honour
`MOCK_LATENCY_MS` and `MOCK_SCENARIO` env vars.

## 3. Implement the real adapter (stub)

Create `src/infrastructure/providers/my-service.real.ts`:

```ts
import type { MyServicePort } from '../../ports/my-service.port.js';
import type { z } from 'zod';
import type { MyServiceRequestSchema } from '../../contracts/my-service/request.js';
import type { MyServiceResponseSchema } from '../../contracts/my-service/response.js';

export class MyServiceReal implements MyServicePort {
  async execute(
    request: z.infer<typeof MyServiceRequestSchema>,
  ): Promise<z.infer<typeof MyServiceResponseSchema>> {
    throw new Error('Not implemented yet');
  }
}
```

**Brief:** From §4.1 rules 5, 9, 10, 11, 13 - strict projection, token handler,
SSE, streaming.

**Today:** Partially implemented - real adapters use `NotImplementedError` stubs;
not ready for production use.

## 4. Register the port in the container

Update `src/composition-root/container.ts`:

```ts
import type { MyServicePort } from '../ports/my-service.port.js';
import { MyServiceMock } from '../infrastructure/providers/my-service.mock.js';
import { MyServiceReal } from '../infrastructure/providers/my-service.real.js';

export function buildContainer(
  env: Env,
  overrides?: Partial<Container>,
): Container {
  const myService: MyServicePort =
    env.PROVIDERS_DEFAULT === 'real'
      ? new MyServiceReal()
      : new MyServiceMock({
          MOCK_LATENCY_MS: Number(env.MOCK_LATENCY_MS),
          MOCK_SCENARIO: env.MOCK_SCENARIO as any,
        });

  return {
    // ...other ports
    myService,
    ...overrides,
  };
}
```

**Brief:** From §2.6 BFF structure - composition-root/container.ts is the single
instantiation point.

**Today:** Enforced - `src/composition-root/container.ts` instantiates all
services; provider selection via env vars.

## 5. Apply the resilience policy (for real adapter)

When the real adapter is ready, wrap it with the resilience policy in the
composition root (target design: `withResiliencePolicy` does not exist yet, see
principle 12 in [bff-principles.md](bff-principles.md)):

```ts
import { withResiliencePolicy } from '../infrastructure/resilience/policy.js';

const realAdapter = new MyServiceReal();
const myService = withResiliencePolicy(realAdapter, {
  timeout: 5000,
  retries: 2,
  circuitBreaker: { threshold: 5, windowMs: 60000 },
});
```

**Brief:** From §4.1 rule 14 - timeouts, retries, circuit breaker per port.

**Today:** Not implemented yet (mock-only BFF; target design). The mock router
simulates latency via `MOCK_LATENCY_MS` but does not apply resilience policies.

## 6. Create the port contract test

Create `tests/port-contracts/my-service.port.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MyServiceMock } from '../../src/infrastructure/providers/my-service.mock.js';

describe('MyServicePort', () => {
  let port: MyServiceMock;

  beforeEach(() => {
    port = new MyServiceMock({ MOCK_LATENCY_MS: 0, MOCK_SCENARIO: 'default' });
  });

  it('executes successfully', async () => {
    const request = {};
    const result = await port.execute(request);
    expect(result).toBeDefined();
  });

  it('handles error scenario', async () => {
    port = new MyServiceMock({ MOCK_LATENCY_MS: 0, MOCK_SCENARIO: 'error' });
    await expect(port.execute({})).rejects.toThrow('Simulated error');
  });
});
```

**Brief:** From §4.1 rule 4 - resilience policy, §4.1 rule 7 - permissions in
response.

**Today:** Partially enforced - mock routes validate against contract schemas;
SectionResult simulation not yet implemented.
