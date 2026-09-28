import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import request, { type Test } from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/composition-root/container.js';
import { loadEnv, type Env } from '../../src/config/env.js';
import { CONTRACT_SCHEMAS, type ContractEntry } from '../../src/contracts/registry.js';
import {
  createMockContractRouter,
  MOCK_EXAMPLE_VARIANT_FILE,
  MOCK_EXAMPLE_VARIANT_QUERY,
  mockContractStatus,
  mockCsrfHeaderName,
} from '../../src/presentation/http/routes/mock.routes.js';

import type { Express } from 'express';

interface ApiClient {
  get(url: string): Test;
  post(url: string): Test;
  put(url: string): Test;
  patch(url: string): Test;
  delete(url: string): Test;
}

interface ApiResponse {
  readonly body: unknown;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly status: number;
  readonly text: string;
}

interface PayloadBudgetOverride {
  readonly bytes: number;
  readonly reason: string;
}

const baseEnv = loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent', PROVIDERS_DEFAULT: 'mock' });
const DEFAULT_VIEW_PAYLOAD_BUDGET_BYTES = 64 * 1024;
const MOCK_EXAMPLES_DIRECTORY = join('src', 'presentation', 'http', 'routes', 'mock-examples');
const PUBLIC_OPERATION_IDS = new Set(['A-01', 'A-02', 'A-04', 'A-05', 'O-04', 'O-05']);
const PASSWORD_LOGIN_PATH = '/api/v1/auth/password-login';
/** The mock A-05 credential pair (MOCK_LOGIN_USERNAME / MOCK_LOGIN_PASSWORD defaults). */
const MOCK_CREDENTIALS = { username: 'ecopetrol@ecopetrol.com', password: 'ecopetrol' } as const;
const pathValues = new Map<string, string>([
  ['analysisId', 'ana_01J9Y8D4T2'],
  ['commentId', 'cmt_01J9Y8D4T2'],
  ['companyId', 'cmp_01J9Y8D4T2'],
  ['draftId', 'drf_01J9Y8D4T2'],
  ['fileId', 'fil_01J9Y8D4T2'],
  ['indicatorId', 'ind_01J9Y8D4T2'],
  ['kviId', 'kvi_01J9Y8D4T2'],
  ['notificationId', 'ntf_01J9Y8D4T2'],
  ['operationId', 'op_01J9Y8D4T2'],
  ['planId', 'pln_01J9Y8D4T2'],
  ['presentationId', 'pre_01J9Y8D4T2'],
  ['profileId', 'prf_01J9Y8D4T2'],
  ['requestId', 'crq_01J9Y8D4T2'],
  ['suggestionId', 'sug_01J9Y8D4T2'],
  ['viewId', 'viw_01J9Y8D4T2'],
]);
const queryExamples = new Map<string, Record<string, string>>([
  ['V-26', { entityId: 'ana_01J9Y8D4T2', entityType: 'analysis' }],
  ['V-46', { screen: 'inicio' }],
  ['V-47', { screen: 'value-monitor' }],
]);
// Update this list (and the test title) whenever the mock examples grow deliberately; never raise a budget instead.
const LARGEST_VIEW_FIXTURES = ['V-30', 'V-42', 'V-03', 'V-20', 'V-10'] as const;

/**
 * Standalone occurrences of the mock password that are not a leak. The password is also the company's own name, so
 * the view fixtures legitimately carry it as a company key (`"ecopetrol": 45`) and as a chart colour key
 * (`"colorKey": "ecopetrol"`); inside ids (`cmp_ecopetrol`), camelCase keys (`ecopetrolValue`) or an e-mail domain it
 * is not a standalone token at all. Any other occurrence, such as an echoed `"password": "ecopetrol"`, is a leak.
 */
const STANDALONE_PASSWORD = /(?<![\w@.-])ecopetrol(?![\w@.-])/g;
const ALLOWED_PASSWORD_CONTEXTS = [
  { before: /"$/, after: /^"\s*:/ },
  { before: /"colorKey"\s*:\s*"$/, after: /^"/ },
] as const;

/** Every standalone occurrence of the mock password in `text` outside the allowed fixture contexts, with context. */
function passwordLeaks(text: string): string[] {
  return [...text.matchAll(STANDALONE_PASSWORD)].flatMap((match) => {
    const start = match.index;
    const before = text.slice(Math.max(0, start - 16), start);
    const after = text.slice(start + match[0].length, start + match[0].length + 4);
    const allowed = ALLOWED_PASSWORD_CONTEXTS.some(
      (context) => context.before.test(before) && context.after.test(after),
    );
    return allowed ? [] : [`${before}${match[0]}${after}`];
  });
}

function responseBodyText(response: ApiResponse): string {
  if (typeof response.text === 'string' && response.text.length > 0) return response.text;
  return Buffer.isBuffer(response.body)
    ? response.body.toString('utf8')
    : JSON.stringify(response.body ?? '');
}

/** Response headers never carry the password in any form or case. */
function expectNoPasswordInHeaders(id: string, response: ApiResponse): void {
  expect(
    JSON.stringify(response.headers),
    `${id} leaked the mock password in a header`,
  ).not.toMatch(/ecopetrol/i);
}

/**
 * Every pattern represents a value that must never cross the BFF boundary.
 * Keep comments next to each category so additions remain reviewable.
 */
export const FORBIDDEN_RESPONSE_PATTERNS = [
  // Credential bearer values and compact JWTs are browser secrets.
  { label: 'bearer or JWT token', pattern: /\b(?:bearer\s+[\w.-]+|eyJ[\w-]*\.[\w-]+\.[\w-]+)\b/i },
  // OAuth and client credential field names disclose authentication material.
  {
    label: 'authentication credential field',
    pattern: /\b(?:authorization|access_token|refresh_token|client_secret)\b/i,
  },
  // SQL catalog and schema references disclose internal data topology.
  { label: 'SQL table reference', pattern: /\b(?:select|from)\s+\w+\.\w+\b/i },
  { label: 'catalog or schema reference', pattern: /\b(?:catalog|schema)\./i },
  // Object-store, DBFS, volume, and Windows paths disclose storage infrastructure.
  { label: 'object storage path', pattern: /\b(?:s3|abfss):\/\//i },
  { label: 'Databricks storage path', pattern: /\b(?:dbfs:\/|\/Volumes\/)/i },
  { label: 'Windows storage path', pattern: /\b[A-Za-z]:\\+/ },
  // A file/line trace leaks implementation details.
  { label: 'stack trace frame', pattern: /\bat\s+.+:\d+:\d+\b/ },
] as const;

/**
 * Default is 64 KiB. Add an operation only for a documented exception and explain the reason.
 */
export const VIEW_PAYLOAD_BUDGET_OVERRIDES: ReadonlyMap<string, PayloadBudgetOverride> = new Map();

/** Every `<ID>.<variant>.response.json` the mock router may serve, as [file, id, variant]. */
function variantExamples(): [string, string, string][] {
  return readdirSync(MOCK_EXAMPLES_DIRECTORY).flatMap((file): [string, string, string][] => {
    const match = MOCK_EXAMPLE_VARIANT_FILE.exec(file);
    const id = match?.[1];
    const variant = match?.[2];
    return id === undefined || variant === undefined ? [] : [[file, id, variant]];
  });
}

function mockApp(env: Env = baseEnv): Express {
  return createApp(createContainer(env), { routers: [createMockContractRouter(env)] });
}

function endpointPath(entry: ContractEntry): string {
  return entry.endpoint.path.replace(
    /:([A-Za-z0-9]+)/g,
    (_match, name: string) => pathValues.get(name) ?? 'mock-id',
  );
}

function call(client: ApiClient, entry: ContractEntry): Test {
  const path = endpointPath(entry);
  switch (entry.endpoint.method) {
    case 'GET':
      return client.get(path);
    case 'POST':
      return client.post(path);
    case 'PUT':
      return client.put(path);
    case 'PATCH':
      return client.patch(path);
    case 'DELETE':
      return client.delete(path);
  }
}

function requestExample(id: string): Record<string, unknown> {
  const fixtures = [
    join('tests', 'contract-examples', `${id}.request.instance.json`),
    join('tests', 'contract-examples', `${id}.request.json`),
  ];
  const fixture = fixtures.find(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed local fixture names from registry IDs.
    (file) => existsSync(file),
  );
  if (fixture === undefined) return {};
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the selected fixture is a local test file.
  return JSON.parse(readFileSync(fixture, 'utf8')) as Record<string, unknown>;
}

function withRequestData(operation: Test, id: string, entry: ContractEntry): Test {
  if (entry.endpoint.method === 'GET') return operation.query(queryExamples.get(id) ?? {});
  if (id === 'C-30') {
    return operation
      .set('Content-Type', 'multipart/form-data; boundary=mock-boundary')
      .send('--mock-boundary--');
  }
  return operation.send(requestExample(id));
}

async function authenticatedClient(
  app: Express,
): Promise<{ readonly client: ApiClient; readonly csrfToken: string }> {
  // Signs in through A-05, so every scanned response is served to a session that has sent the password.
  const client = request.agent(app);
  expect((await client.post(PASSWORD_LOGIN_PATH).send(MOCK_CREDENTIALS)).status).toBe(200);
  const session = await client.get('/api/v1/session');
  expect(session.status).toBe(200);
  const csrfToken = (session.body as { csrfToken?: unknown }).csrfToken;
  if (typeof csrfToken !== 'string') throw new Error('Mock session did not include a CSRF token');
  return { client, csrfToken };
}

async function authenticatedResponse(
  app: Express,
  id: string,
  entry: ContractEntry,
  includeCsrf = true,
): Promise<ApiResponse> {
  if (id === 'A-01') {
    return request(app).get(endpointPath(entry)).query({ returnTo: '/inicio' }).redirects(0);
  }
  if (id === 'A-02') {
    return request(app)
      .get(endpointPath(entry))
      .query({ code: 'mock-code', state: 'mock-state' })
      .redirects(0);
  }
  if (id === 'A-05') {
    return request(app).post(endpointPath(entry)).send(requestExample(id));
  }

  const { client, csrfToken } = await authenticatedClient(app);
  let operation = withRequestData(call(client, entry), id, entry);
  if (includeCsrf && entry.endpoint.method !== 'GET') {
    operation = operation.set(mockCsrfHeaderName, csrfToken);
  }
  return operation;
}

function serializedResponse(response: ApiResponse): string {
  const body =
    typeof response.text === 'string' && response.text.length > 0
      ? response.text
      : Buffer.isBuffer(response.body)
        ? response.body.toString('utf8')
        : JSON.stringify(response.body);
  return JSON.stringify({ headers: response.headers, body });
}

function payloadBudget(id: string): number {
  const override = VIEW_PAYLOAD_BUDGET_OVERRIDES.get(id);
  return override?.bytes ?? DEFAULT_VIEW_PAYLOAD_BUDGET_BYTES;
}

function parseStrictJsonResponse(id: string, entry: ContractEntry, response: ApiResponse): void {
  if (id === 'O-02') {
    entry.response.parse(JSON.parse(response.text.replace(/^data: /, '').trim()));
    return;
  }
  if (id === 'C-33') {
    const payloads = [...response.text.matchAll(/^data: (.+)$/gm)].map((match) => {
      const data = match.at(1);
      if (data === undefined) throw new Error('C-33 SSE event is missing data');
      return JSON.parse(data) as unknown;
    });
    // Contract 0.2.0 publishes the CF-111 event union itself (c33ResponseSchema).
    for (const payload of payloads) entry.response.parse(payload);
    return;
  }
  const contentType = response.headers['content-type'];
  if (typeof contentType !== 'string' || !contentType.includes('application/json')) return;
  entry.response.parse(response.body);
}

describe('mock contract router security', () => {
  it.each(Object.entries(CONTRACT_SCHEMAS))(
    '%s exposes no secret or infrastructure markers in its response',
    async (id, entry) => {
      const response = await authenticatedResponse(mockApp(), id, entry);

      expect(response.status).toBe(id === 'A-01' || id === 'A-02' ? 302 : mockContractStatus(id));
      const serialized = serializedResponse(response);
      for (const forbidden of FORBIDDEN_RESPONSE_PATTERNS) {
        expect(serialized, `${id} leaked ${forbidden.label}`).not.toMatch(forbidden.pattern);
      }
      expectNoPasswordInHeaders(id, response);
      expect(passwordLeaks(responseBodyText(response)), `${id} leaked the mock password`).toEqual(
        [],
      );
    },
  );

  it('the password leak scan flags an echoed password but not the fixture company keys', () => {
    expect(passwordLeaks('{"password":"ecopetrol"}')).toHaveLength(1);
    expect(passwordLeaks('{"values":["ecopetrol"]}')).toHaveLength(1);
    expect(passwordLeaks('{"message":"bad ecopetrol"}')).toHaveLength(1);
    expect(
      passwordLeaks(
        '{"ecopetrol": 45, "colorKey":"ecopetrol", "id":"cmp_ecopetrol", "ecopetrolValue":1, "u":"a@ecopetrol.com"}',
      ),
    ).toEqual([]);
  });

  describe('A-05 mock password login', () => {
    const attempts = {
      success: MOCK_CREDENTIALS,
      wrongPassword: { ...MOCK_CREDENTIALS, password: 'not-the-password' },
      unknownUser: { ...MOCK_CREDENTIALS, username: 'nobody@ecopetrol.com' },
      badBody: { username: MOCK_CREDENTIALS.password, password: MOCK_CREDENTIALS.password },
    } as const;

    it.each(Object.entries(attempts))(
      '%s: the literal password is in no response header or body',
      async (_kind, body) => {
        const response = await request(mockApp()).post(PASSWORD_LOGIN_PATH).send(body);

        expect(response.status).not.toBe(500);
        expectNoPasswordInHeaders('A-05', response);
        expect(responseBodyText(response)).not.toMatch(/ecopetrol/i);
      },
    );

    it('answers wrong password and unknown user with one identical 401 body (only traceId differs)', async () => {
      const app = mockApp();
      const wrongPassword = await request(app)
        .post(PASSWORD_LOGIN_PATH)
        .send(attempts.wrongPassword);
      const unknownUser = await request(app).post(PASSWORD_LOGIN_PATH).send(attempts.unknownUser);

      expect(wrongPassword.status).toBe(401);
      expect(unknownUser.status).toBe(401);
      const traceIds = [wrongPassword.body, unknownUser.body].map(
        (body) => (body as { traceId?: unknown }).traceId,
      );
      const normalized = (text: string, traceId: unknown): string =>
        text.replace(String(traceId), '<traceId>');
      expect(normalized(unknownUser.text, traceIds[1])).toBe(
        normalized(wrongPassword.text, traceIds[0]),
      );
      expect(wrongPassword.body).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'The username or password is incorrect',
        traceId: traceIds[0],
      });
    });
  });

  it.each(Object.entries(CONTRACT_SCHEMAS))(
    '%s JSON success response parses with its strict contract schema',
    async (id, entry) => {
      const response = await authenticatedResponse(mockApp(), id, entry);

      expect(() => {
        parseStrictJsonResponse(id, entry, response);
      }, `${id} has undeclared response fields`).not.toThrow();
    },
  );

  it.each(
    Object.entries(CONTRACT_SCHEMAS).filter(
      ([id, entry]) => entry.endpoint.method !== 'GET' && !PUBLIC_OPERATION_IDS.has(id),
    ),
  )('%s rejects an authenticated unsafe request without CSRF', async (id, entry) => {
    const response = await authenticatedResponse(mockApp(), id, entry, false);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: 'CSRF_INVALID' });
  });

  it.each(Object.entries(CONTRACT_SCHEMAS).filter(([id]) => !PUBLIC_OPERATION_IDS.has(id)))(
    '%s rejects an unauthenticated request',
    async (id, entry) => {
      const response = await withRequestData(call(request(mockApp()), entry), id, entry);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED' });
    },
  );

  it.each(variantExamples())(
    '%s variant example parses strictly and leaks nothing through its route',
    async (file, id, variant) => {
      const entry = Object.entries(CONTRACT_SCHEMAS).find(([candidate]) => candidate === id)?.[1];
      if (entry === undefined) throw new Error(`${file} names no registered operation`);
      const parameter = MOCK_EXAMPLE_VARIANT_QUERY.get(id);
      if (parameter === undefined) throw new Error(`${file} has no variant selector`);
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the file comes from the fixed mock-examples folder.
      const raw = JSON.parse(readFileSync(join(MOCK_EXAMPLES_DIRECTORY, file), 'utf8')) as unknown;
      expect(() => entry.response.parse(raw), `${file} has undeclared fields`).not.toThrow();

      const { client } = await authenticatedClient(mockApp());
      const response = await call(client, entry).query({
        ...queryExamples.get(id),
        [parameter]: variant,
      });
      expect(response.status).toBe(200);
      expect(entry.response.parse(response.body)).toEqual(entry.response.parse(raw));
      const serialized = serializedResponse(response);
      for (const forbidden of FORBIDDEN_RESPONSE_PATTERNS) {
        expect(serialized, `${file} leaked ${forbidden.label}`).not.toMatch(forbidden.pattern);
      }
    },
  );

  it('A-04 answers 401 without a session cookie', async () => {
    const response = await request(mockApp()).get('/api/v1/session');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('keeps all V-xx responses under budget (largest: V-30, V-42, V-03, V-20, V-10)', async () => {
    const views = Object.entries(CONTRACT_SCHEMAS).filter(([id]) => id.startsWith('V-'));
    const payloads: { readonly id: string; readonly bytes: number }[] = [];

    for (const [id, entry] of views) {
      const response = await authenticatedResponse(mockApp(), id, entry);
      expect(response.status).toBe(200);
      const bytes = Buffer.byteLength(response.text, 'utf8');
      payloads.push({ id, bytes });
      expect(bytes, `${id} mock payload is ${String(bytes)} bytes`).toBeLessThanOrEqual(
        payloadBudget(id),
      );
    }

    const largest = payloads.sort((left, right) => right.bytes - left.bytes).slice(0, 5);
    expect(largest.map(({ id }) => id)).toEqual([...LARGEST_VIEW_FIXTURES]);
  }, 30_000);
});
