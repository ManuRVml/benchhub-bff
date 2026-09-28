import { z } from 'zod';

// Validated process configuration (brief L236-262: "Zod; falla al arrancar si falta algo").
// `loadEnv` never reads process.env itself: the entry point passes it in, tests pass plain objects.

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const port = z.coerce
  .number({ error: 'must be an integer between 0 and 65535' })
  .int('must be an integer between 0 and 65535')
  .min(0, 'must be an integer between 0 and 65535')
  .max(65535, 'must be an integer between 0 and 65535');

const booleanString = z
  .enum(['true', 'false', '1', '0'], { error: 'must be "true" or "false"' })
  .transform((value) => value === 'true' || value === '1');

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: port.default(3001),
    // Databricks Apps injects the port to bind (ADR-0007); it wins over PORT when present.
    DATABRICKS_APP_PORT: port.optional(),
    LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
    PROVIDERS_DEFAULT: z.enum(['mock', 'real']).default('mock'),
    MOCK_SCENARIO: z
      .enum(['default', 'empty', 'error', 'slow', 'partial', 'forbidden'])
      .default('default'),
    MOCK_ROLE: z
      .enum([
        'analyst_creator',
        'explorer_viewer',
        'explorer_integral',
        'executive_viewer',
        'executive_integral',
      ])
      .default('analyst_creator'),
    MOCK_LATENCY_MS: z.coerce
      .number({ error: 'must be an integer >= 0' })
      .int('must be an integer >= 0')
      .min(0, 'must be an integer >= 0')
      .default(0),
    // The one credential pair the mock A-05 password login accepts (owner decision 2026-09-28). Mock only: the real
    // login is OIDC (A-01/A-02). The username is compared case-insensitively after trim, the password exactly.
    MOCK_LOGIN_USERNAME: z
      .string()
      .trim()
      .max(254, 'must be an e-mail address of at most 254 characters')
      .pipe(z.email({ error: 'must be an e-mail address' }))
      .default('ecopetrol@ecopetrol.com'),
    MOCK_LOGIN_PASSWORD: z
      .string()
      .min(1, 'must have 1 to 128 characters')
      .max(128, 'must have 1 to 128 characters')
      .default('ecopetrol'),
    // Requests per minute per client IP (security.ts rateLimiter). Production keeps 300; the local stack raises it,
    // because the whole Playwright run reaches the BFF through one nginx hop, as a single client.
    RATE_LIMIT_PER_MINUTE: z.coerce
      .number({ error: 'must be a positive integer' })
      .int('must be a positive integer')
      .min(1, 'must be a positive integer')
      .default(300),
    SESSION_SECRET: z.string().min(32, 'must be at least 32 characters').optional(),
    SESSION_STORE: z
      .enum(['memory', 'lakebase'])
      .default('memory')
      .refine((store) => store !== 'lakebase', {
        message: 'lakebase is not available until Phase 4 (ADR-0004); use "memory"',
      }),
    OTEL_ENABLED: booleanString.default(false),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.SESSION_SECRET === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['SESSION_SECRET'],
        message: 'is required when NODE_ENV=production (at least 32 characters)',
      });
    }
  })
  .transform(({ DATABRICKS_APP_PORT, ...env }) => ({
    ...env,
    PORT: DATABRICKS_APP_PORT ?? env.PORT,
  }));

export type Env = Readonly<z.output<typeof envSchema>>;

export interface EnvIssue {
  readonly variable: string;
  readonly message: string;
}

/** Thrown by `loadEnv` when one or more variables are missing or invalid; lists every failing variable. */
export class EnvValidationError extends Error {
  override readonly name = 'EnvValidationError';
  readonly issues: readonly EnvIssue[];

  constructor(issues: readonly EnvIssue[]) {
    super(
      `Invalid environment configuration: ${issues
        .map((issue) => `${issue.variable} ${issue.message}`)
        .join('; ')}`,
    );
    this.issues = issues;
  }

  get variables(): readonly string[] {
    return [...new Set(this.issues.map((issue) => issue.variable))];
  }
}

/** Empty strings count as "not set", so `SESSION_SECRET=` in a .env file behaves like a missing variable. */
function withoutEmptyValues(source: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, string] => entry[1] !== undefined && entry[1].trim() !== '',
    ),
  );
}

export function loadEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(withoutEmptyValues(source));
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => ({
        variable: issue.path.map(String).join('.') || '(root)',
        message: issue.message,
      })),
    );
  }
  return Object.freeze(result.data);
}
