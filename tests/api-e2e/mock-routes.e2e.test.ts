import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import request, { type Test } from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/composition-root/container.js';
import { loadEnv, type Env } from '../../src/config/env.js';
import { v08ResponseSchema } from '../../src/contracts/analysis-definition/v-08-analysis-validation.js';
import { c03ResponseSchema } from '../../src/contracts/commands/c-03-generate-analysis.js';
import { c14ResponseSchema } from '../../src/contracts/commands/c-14-export-product.js';
import { o01ResponseSchema } from '../../src/contracts/operations/o-01-operation-status.js';
import { o02ResponseSchema } from '../../src/contracts/operations/o-02-operation-events.js';
import { CONTRACT_SCHEMAS, type ContractEntry } from '../../src/contracts/registry.js';
import {
  createMockContractRouter,
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

const baseEnv = loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent', PROVIDERS_DEFAULT: 'mock' });
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
const PUBLIC_OPERATION_IDS = new Set(['A-01', 'A-02', 'O-04', 'O-05']);

function mockApp(env: Env = baseEnv): Express {
  return createApp(createContainer(env), { routers: [createMockContractRouter(env)] });
}

function scenarioEnv(scenario: Env['MOCK_SCENARIO']): Env {
  return loadEnv({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    PROVIDERS_DEFAULT: 'mock',
    MOCK_SCENARIO: scenario,
  });
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
  const examples = [
    join('tests', 'contract-examples', `${id}.request.instance.json`),
    join('tests', 'contract-examples', `${id}.request.json`),
  ];
  const example = examples.find(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test fixtures are selected from fixed names.
    (file) => existsSync(file),
  );
  if (example === undefined) return {};
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the selected file is a local contract fixture.
  return JSON.parse(readFileSync(example, 'utf8')) as Record<string, unknown>;
}

function contract(id: string): ContractEntry {
  const found = Object.entries(CONTRACT_SCHEMAS).find(([candidate]) => candidate === id);
  if (found === undefined) throw new Error(`Missing contract ${id}`);
  return found[1];
}

function assertLoginRedirect(response: ApiResponse): void {
  expect(response.status).toBe(302);
  expect(response.headers.location).toContain('/api/v1/auth/callback');
}

function assertCallbackRedirect(response: ApiResponse): void {
  expect(response.status).toBe(302);
}

function assertPasswordLogin(response: ApiResponse, entry: ContractEntry): void {
  expect(response.status).toBe(200);
  entry.response.parse(response.body);
}

function assertNoContent(response: ApiResponse): void {
  expect(response.text).toBe('');
}

function assertSseResponse(response: ApiResponse, entry: ContractEntry): void {
  expect(response.headers['content-type']).toContain('text/event-stream');
  const data = response.text.replace(/^data: /, '').trim();
  entry.response.parse(JSON.parse(data));
}

function ssePayloads(response: ApiResponse): unknown[] {
  return [...response.text.matchAll(/^data: (.+)$/gm)].map((match) => {
    const data = match.at(1);
    if (data === undefined) throw new Error('Mock SSE event is missing data');
    return JSON.parse(data) as unknown;
  });
}

function assertAssistantSseResponse(response: ApiResponse): void {
  expect(response.headers['content-type']).toContain('text/event-stream');
}

function isRecord(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === 'object' && payload !== null;
}

function hasAssistantEventType(payload: unknown, type: string): boolean {
  return isRecord(payload) && payload.type === type;
}

function hasMockDoneEvent(payload: unknown): boolean {
  if (!isRecord(payload) || payload.type !== 'done') return false;
  return typeof payload.messageId === 'string' && payload.messageId.startsWith('msg_mock_');
}

function assertDownload(response: ApiResponse): void {
  expect(response.headers['content-type']).toContain('application/octet-stream');
  expect((response.body as Buffer).toString()).toBe('mock file');
}

async function authenticatedClient(
  app: Express,
): Promise<{ client: ApiClient; csrfToken: string }> {
  const client = request.agent(app);
  const login = await client.get('/api/v1/auth/login').query({ returnTo: '/inicio' }).redirects(0);
  expect(login.status).toBe(302);
  const callbackLocation = login.headers.location;
  if (typeof callbackLocation !== 'string')
    throw new Error('Mock login did not return a callback location');
  const callback = await client.get(callbackLocation).redirects(0);
  expect(callback.status).toBe(302);
  const session = await client.get('/api/v1/session');
  expect(session.status).toBe(200);
  return { client, csrfToken: (session.body as { csrfToken: string }).csrfToken };
}

describe('mock contract routes', () => {
  it.each(Object.entries(CONTRACT_SCHEMAS))(
    '%s serves its documented success contract',
    async (id, entry) => {
      const app = mockApp();

      if (id === 'A-01') {
        const response = await request(app)
          .get(endpointPath(entry))
          .query({ returnTo: '/inicio' })
          .redirects(0);
        assertLoginRedirect(response);
        return;
      }

      if (id === 'A-02') {
        const response = await request(app)
          .get(endpointPath(entry))
          .query({ code: 'mock-code', state: 'mock-state' })
          .redirects(0);
        assertCallbackRedirect(response);
        return;
      }

      if (id === 'A-05') {
        const response = await request(app).post(endpointPath(entry)).send(requestExample(id));
        assertPasswordLogin(response, entry);
        return;
      }

      const needsSession = !PUBLIC_OPERATION_IDS.has(id);
      const auth = needsSession ? await authenticatedClient(app) : undefined;
      const client: ApiClient = auth?.client ?? request(app);
      let operation = call(client, entry);

      if (entry.endpoint.method === 'GET') operation = operation.query(queryExamples.get(id) ?? {});
      if (entry.endpoint.method !== 'GET') {
        const csrfToken = auth?.csrfToken;
        if (typeof csrfToken !== 'string') throw new Error(`Missing CSRF token for ${id}`);
        operation = operation.set(mockCsrfHeaderName, csrfToken);
        if (id === 'C-30') {
          operation = operation
            .set('Content-Type', 'multipart/form-data; boundary=mock-boundary')
            .send('--mock-boundary--');
        } else {
          operation = operation.send(requestExample(id));
        }
      }

      const response = await operation;
      expect(response.status).toBe(mockContractStatus(id));

      if (id === 'A-03') {
        assertNoContent(response);
        return;
      }
      if (id === 'O-02') {
        assertSseResponse(response, entry);
        return;
      }
      if (id === 'C-33') {
        assertAssistantSseResponse(response);
        return;
      }
      if (id === 'O-03') {
        assertDownload(response);
        return;
      }
      entry.response.parse(response.body);
    },
  );

  it('requires a session and completes the A-01 to A-02 flow before A-04', async () => {
    const app = mockApp();
    expect((await request(app).get('/api/v1/session')).status).toBe(401);

    const { client } = await authenticatedClient(app);
    const session = await client.get('/api/v1/session');
    expect(session.status).toBe(200);
    expect(session.body).toMatchObject({ role: 'analyst_creator' });
    contract('A-04').response.parse(session.body);
  });

  describe('A-05 mock password login', () => {
    const PASSWORD_LOGIN = '/api/v1/auth/password-login';
    const credentials = { username: 'ecopetrol@ecopetrol.com', password: 'ecopetrol' };

    function sessionCookie(response: ApiResponse): string | undefined {
      const setCookie = response.headers['set-cookie'];
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      return cookies.find((cookie) => cookie?.startsWith('eco_mock_session='));
    }

    it('signs in without a session or CSRF token, sets the cookie, and then A-04 works', async () => {
      const client = request.agent(mockApp());
      const login = await client.post(PASSWORD_LOGIN).send(credentials);

      expect(login.status).toBe(200);
      expect(sessionCookie(login)).toMatch(/^eco_mock_session=[0-9a-f]{64};.*HttpOnly/);
      const body = contract('A-05').response.parse(login.body) as { csrfToken?: string };
      expect(body).toMatchObject({ role: 'analyst_creator' });
      expect(body.csrfToken).toMatch(/^[0-9a-f]{48}$/);

      const session = await client.get('/api/v1/session');
      expect(session.status).toBe(200);
      expect(session.body).toMatchObject({ csrfToken: body.csrfToken });
      contract('A-04').response.parse(session.body);

      const created = await client
        .post('/api/v1/analysis-drafts')
        .set(mockCsrfHeaderName, body.csrfToken ?? '')
        .send(requestExample('C-01'));
      expect(created.status).toBe(201);
    });

    it('accepts the username case-insensitively after trim', async () => {
      const response = await request(mockApp())
        .post(PASSWORD_LOGIN)
        .send({ username: '  EcoPetrol@ECOPETROL.com ', password: 'ecopetrol' });

      expect(response.status).toBe(200);
    });

    it('answers 401 INVALID_CREDENTIALS to a wrong password and sets no cookie', async () => {
      const response = await request(mockApp())
        .post(PASSWORD_LOGIN)
        .send({ ...credentials, password: 'Ecopetrol' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'The username or password is incorrect',
      });
      expect(sessionCookie(response)).toBeUndefined();
    });

    it('answers an unknown user with the same 401 body as a wrong password', async () => {
      const app = mockApp();
      const unknownUser = await request(app)
        .post(PASSWORD_LOGIN)
        .send({ ...credentials, username: 'nobody@ecopetrol.com' });
      const wrongPassword = await request(app)
        .post(PASSWORD_LOGIN)
        .send({ ...credentials, password: 'wrong' });

      expect(unknownUser.status).toBe(401);
      // traceId is per request by design; everything else must be identical.
      const withoutTraceId = (body: unknown): Record<string, unknown> =>
        Object.fromEntries(
          Object.entries(body as Record<string, unknown>).filter(([key]) => key !== 'traceId'),
        );
      const unknownBody = withoutTraceId(unknownUser.body);
      expect(unknownBody).toEqual(withoutTraceId(wrongPassword.body));
      expect(unknownBody).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'The username or password is incorrect',
      });
    });

    it.each([
      ['a missing password', { username: credentials.username }],
      ['an empty password', { ...credentials, password: '' }],
      ['a username that is not an e-mail', { ...credentials, username: 'analyst_creator' }],
      ['an extra field', { ...credentials, returnTo: '/inicio' }],
      ['a too long password', { ...credentials, password: 'x'.repeat(129) }],
    ])('answers 400 BAD_REQUEST to %s', async (_label, body) => {
      const response = await request(mockApp()).post(PASSWORD_LOGIN).send(body);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('reads the credential pair from MOCK_LOGIN_USERNAME and MOCK_LOGIN_PASSWORD', async () => {
      const app = mockApp(
        loadEnv({
          NODE_ENV: 'test',
          LOG_LEVEL: 'silent',
          PROVIDERS_DEFAULT: 'mock',
          MOCK_LOGIN_USERNAME: 'demo@example.com',
          MOCK_LOGIN_PASSWORD: 'other-secret',
        }),
      );

      expect((await request(app).post(PASSWORD_LOGIN).send(credentials)).status).toBe(401);
      const response = await request(app)
        .post(PASSWORD_LOGIN)
        .send({ username: 'demo@example.com', password: 'other-secret' });
      expect(response.status).toBe(200);
    });
  });

  // The wizard opens V-05 with the draft id C-01 returns, so both examples carry the same realistic id.
  it('creates a C-01 draft whose id opens the same V-05 draft', async () => {
    const { client, csrfToken } = await authenticatedClient(mockApp());
    const created = await client
      .post('/api/v1/analysis-drafts')
      .set(mockCsrfHeaderName, csrfToken)
      .send(requestExample('C-01'));
    expect(created.status).toBe(201);
    const { draftId } = contract('C-01').response.parse(created.body) as { draftId: string };
    expect(draftId).toBe('drf_01J9ZA2B3C');

    const definition = await client.get(`/api/v1/views/analysis-definition/${draftId}`);
    expect(definition.status).toBe(200);
    expect(contract('V-05').response.parse(definition.body)).toMatchObject({
      draft: { id: draftId },
    });
  });
  it('rejects unsafe calls without CSRF and accepts the session token', async () => {
    const app = mockApp();
    const { client, csrfToken } = await authenticatedClient(app);
    const body = requestExample('C-01');

    expect((await client.post('/api/v1/analysis-drafts').send(body)).status).toBe(403);
    const response = await client
      .post('/api/v1/analysis-drafts')
      .set(mockCsrfHeaderName, csrfToken)
      .send(body);
    expect(response.status).toBe(201);
    contract('C-01').response.parse(response.body);
  });

  it('streams CF-111 assistant token and done events after session and CSRF validation', async () => {
    const app = mockApp();
    const { client, csrfToken } = await authenticatedClient(app);
    const response = await client
      .post('/api/v1/assistant/messages')
      .set(mockCsrfHeaderName, csrfToken)
      .send(requestExample('C-33'));

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/event-stream');
    const payloads = ssePayloads(response);
    expect(payloads.some((payload) => hasAssistantEventType(payload, 'token'))).toBe(true);
    expect(payloads.some(hasMockDoneEvent)).toBe(true);
  });

  it('streams the assistant error event in the error scenario', async () => {
    const { client, csrfToken } = await authenticatedClient(mockApp(scenarioEnv('error')));
    const response = await client
      .post('/api/v1/assistant/messages')
      .set(mockCsrfHeaderName, csrfToken)
      .send(requestExample('C-33'));

    expect(response.status).toBe(200);
    expect(ssePayloads(response)).toEqual([{ errorCode: 'ASSISTANT_UNAVAILABLE', type: 'error' }]);
  });

  it('requires session and CSRF before streaming assistant events', async () => {
    const app = mockApp();
    const body = requestExample('C-33');
    expect((await request(app).post('/api/v1/assistant/messages').send(body)).status).toBe(401);

    const { client } = await authenticatedClient(app);
    const response = await client.post('/api/v1/assistant/messages').send(body);
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: 'CSRF_INVALID' });
  });

  it('maps an invalid view query to the standard 400 error body', async () => {
    const { client } = await authenticatedClient(mockApp());
    const response = await client
      .get('/api/v1/views/assistant-context')
      .query({ screen: 'invalid' });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: 'BAD_REQUEST',
      message: 'The request could not be processed',
    });
    const errorBody = response.body as { traceId: string };
    expect(errorBody.traceId).toMatch(/^[\da-f]{32}$/);
  });

  it('maps the error scenario to a standard error body for views', async () => {
    const env = loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent', MOCK_SCENARIO: 'error' });
    const { client } = await authenticatedClient(mockApp(env));
    const response = await client.get('/api/v1/views/home');
    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      code: 'MOCK_SCENARIO_ERROR',
      message: 'Mock scenario error',
    });
  });

  it('returns one failed V-03 section in the partial scenario', async () => {
    const entry = contract('V-03');
    const { client } = await authenticatedClient(mockApp(scenarioEnv('partial')));
    const response = await client.get(entry.endpoint.path);

    expect(response.status).toBe(200);
    const body = entry.response.parse(response.body) as Record<string, unknown>;
    const errors = Object.entries(body).filter(
      ([section, value]) =>
        ['banner', 'executiveSummary', 'enabledAnalyses', 'peerNews', 'marketIndicators'].includes(
          section,
        ) &&
        typeof value === 'object' &&
        value !== null &&
        (value as { status?: unknown }).status === 'error',
    );
    expect(errors).toHaveLength(1);
  });

  it('returns empty V-04 items in the empty scenario', async () => {
    const entry = contract('V-04');
    const { client } = await authenticatedClient(mockApp(scenarioEnv('empty')));
    const response = await client.get(entry.endpoint.path);

    expect(response.status).toBe(200);
    const body = entry.response.parse(response.body) as { items: unknown[] };
    expect(body.items).toEqual([]);
  });

  it.each(['empty', 'partial'] as const)(
    'keeps every view response valid in the %s scenario',
    async (scenario) => {
      const app = mockApp(scenarioEnv(scenario));
      const { client } = await authenticatedClient(app);
      const views = Object.entries(CONTRACT_SCHEMAS).filter(([id]) => id.startsWith('V-'));

      for (const [id, entry] of views) {
        const response = await client.get(endpointPath(entry)).query(queryExamples.get(id) ?? {});
        expect(response.status).toBe(200);
        entry.response.parse(response.body);
      }
    },
  );

  it('advances a registered export from polling to its download', async () => {
    const { client, csrfToken } = await authenticatedClient(mockApp());
    const created = await client
      .post('/api/v1/exports')
      .set(mockCsrfHeaderName, csrfToken)
      .send(requestExample('C-14'));
    expect(created.status).toBe(202);
    const accepted = c14ResponseSchema.parse(created.body);

    const running = await client.get(`/api/v1/operations/${accepted.operationId}`);
    expect(running.status).toBe(200);
    expect(o01ResponseSchema.parse(running.body)).toMatchObject({
      result: null,
      status: 'running',
    });

    const succeeded = await client.get(`/api/v1/operations/${accepted.operationId}`);
    const operation = o01ResponseSchema.parse(succeeded.body);
    expect(operation).toMatchObject({ progressPct: 100, status: 'succeeded' });
    if (operation.result === null || !('fileId' in operation.result)) {
      throw new Error('The export operation did not return a file result');
    }
    expect(operation.result.fileId.length).toBeGreaterThan(0);
    expect(operation.result.fileName.length).toBeGreaterThan(0);

    const download = await client.get(`/api/v1/files/${operation.result.fileId}/download`);
    expect(download.status).toBe(200);
    expect(download.headers['content-type']).toContain('application/octet-stream');
    expect(download.headers['content-disposition']).toContain(operation.result.fileName);
  });

  it('advances a registered analysis generation and streams a terminal event', async () => {
    const { client, csrfToken } = await authenticatedClient(mockApp());
    const created = await client
      .post('/api/v1/analysis-drafts/drf_01J9Y8D4T2/generation')
      .set(mockCsrfHeaderName, csrfToken)
      .send({});
    expect(created.status).toBe(202);
    const accepted = c03ResponseSchema.parse(created.body);

    const running = await client.get(`/api/v1/operations/${accepted.operationId}`);
    expect(o01ResponseSchema.parse(running.body)).toMatchObject({ status: 'running' });
    const succeeded = await client.get(`/api/v1/operations/${accepted.operationId}`);
    expect(o01ResponseSchema.parse(succeeded.body)).toMatchObject({ status: 'succeeded' });

    const events = await client.get(`/api/v1/operations/${accepted.operationId}/events`);
    expect(events.headers['content-type']).toContain('text/event-stream');
    expect(events.text).toContain('event: progress');
    expect(events.text).toContain('event: done');
    const payloads = [...events.text.matchAll(/^data: (.+)$/gm)].map((match) => {
      const data = match.at(1);
      if (data === undefined) throw new Error('Mock SSE event is missing data');
      return JSON.parse(data) as unknown;
    });
    expect(payloads).toHaveLength(2);
    for (const payload of payloads) o02ResponseSchema.parse(payload);
  });

  it('returns a valid failed operation after the first poll in the error scenario', async () => {
    const { client, csrfToken } = await authenticatedClient(mockApp(scenarioEnv('error')));
    const created = await client
      .post('/api/v1/exports')
      .set(mockCsrfHeaderName, csrfToken)
      .send(requestExample('C-14'));
    const accepted = c14ResponseSchema.parse(created.body);

    expect(
      o01ResponseSchema.parse(
        (await client.get(`/api/v1/operations/${accepted.operationId}`)).body,
      ),
    ).toMatchObject({ status: 'running' });
    expect(
      o01ResponseSchema.parse(
        (await client.get(`/api/v1/operations/${accepted.operationId}`)).body,
      ),
    ).toMatchObject({
      error: { code: 'MOCK_OPERATION_FAILED' },
      result: null,
      status: 'failed',
    });
  });

  it('allows generation after saving the draft in the current session', async () => {
    const { client, csrfToken } = await authenticatedClient(mockApp());
    const beforeSave = await client.get('/api/v1/views/analysis-validation/drf_01J9Y8D4T2');
    expect(v08ResponseSchema.parse(beforeSave.body)).toMatchObject({
      permissions: { canGenerate: false },
    });

    const saved = await client
      .patch('/api/v1/analysis-drafts/drf_01J9Y8D4T2')
      .set(mockCsrfHeaderName, csrfToken)
      .send(requestExample('C-02'));
    expect(saved.status).toBe(200);

    const afterSave = await client.get('/api/v1/views/analysis-validation/drf_01J9Y8D4T2');
    expect(v08ResponseSchema.parse(afterSave.body)).toMatchObject({
      permissions: { canGenerate: true },
    });
  });

  // The SCR-09 report comments rail asks V-26 with entityType=analysis (the enum has no `report` value); it keeps the
  // default example, while entityType=presentation selects V-26.presentation.response.json.
  it.each([
    [
      'presentation',
      'prs_directorio_t4',
      ['Alejandra Ríos', 'Jorge Salas'],
      ['comment', 'comment'],
    ],
    [
      'analysis',
      'ana_01J9Y8D4T2',
      ['Alejandra Ríos', 'Alejandra Ríos'],
      ['comment', 'change_request'],
    ],
  ] as const)(
    'serves the V-26 comment threads of entityType=%s',
    async (entityType, entityId, authors, kinds) => {
      const { client } = await authenticatedClient(mockApp());
      const response = await client
        .get('/api/v1/views/comment-thread')
        .query({ entityId, entityType });

      expect(response.status).toBe(200);
      const body = contract('V-26').response.parse(response.body) as {
        items: { author: { name: string }; kind: string }[];
        totalItems: number;
      };
      expect(body.totalItems).toBe(2);
      expect(body.items.map((item) => item.author.name)).toEqual(authors);
      expect(body.items.map((item) => item.kind)).toEqual(kinds);
    },
  );

  // The SCR-08 category tabs select V-11.<category>.response.json; with no category it stays Rentabilidad.
  // Values from the prototype CATEGORIES: ROACE 7.4 vs 5.5 ... Prueba ácida 1.3 vs 0.8, Razón corriente 1.5 vs 1.2.
  it.each([
    [
      undefined,
      'rentabilidad',
      ['ind_roace', 'ind_margen_ebitda', 'ind_crec_ebitda'],
      [
        [7.4, 5.5],
        [39, 32],
        [-13.8, -2.2],
      ],
    ],
    [
      'liquidez',
      'liquidez',
      ['ind_prueba_acida', 'ind_razon_corriente'],
      [
        [1.3, 0.8],
        [1.5, 1.2],
      ],
    ],
  ] as const)(
    'serves the V-11 rows of category=%s',
    async (category, expected, indicators, values) => {
      const { client } = await authenticatedClient(mockApp());
      const response = await client
        .get(endpointPath(contract('V-11')))
        .query(category === undefined ? {} : { category });

      expect(response.status).toBe(200);
      const body = contract('V-11').response.parse(response.body) as {
        category: string;
        rows: { indicatorId: string; geValue: number; peerAvg: number }[];
      };
      expect(body.category).toBe(expected);
      expect(body.rows.map((row) => row.indicatorId)).toEqual(indicators);
      expect(body.rows.map((row) => [row.geValue, row.peerAvg])).toEqual(values);
    },
  );

  // The SCR-09 "Ranking por categoría" tabs select V-21.<dimension>.response.json; with none it stays `fin`.
  it.each([
    [undefined, 'fin', 'TotalEnergies', 3],
    ['op', 'op', 'Shell', 5],
  ] as const)(
    'serves the V-21 ranking of dimension=%s',
    async (dimension, expected, leader, ecopetrolRank) => {
      const { client } = await authenticatedClient(mockApp());
      const response = await client
        .get(endpointPath(contract('V-21')))
        .query(dimension === undefined ? {} : { dimension });

      expect(response.status).toBe(200);
      const body = contract('V-21').response.parse(response.body) as {
        dimension: string;
        rows: { rank: number; name: string; isLeader: boolean; isEcopetrol: boolean }[];
      };
      expect(body.dimension).toBe(expected);
      expect(body.rows).toHaveLength(7);
      expect(body.rows[0]).toMatchObject({ rank: 1, name: leader, isLeader: true });
      expect(body.rows.find((row) => row.isEcopetrol)?.rank).toBe(ecopetrolRank);
    },
  );

  it('lists as many V-10 missing indicators for the selected company as its card counts', async () => {
    const { client } = await authenticatedClient(mockApp());
    const response = await client.get(endpointPath(contract('V-10')));

    expect(response.status).toBe(200);
    const body = contract('V-10').response.parse(response.body) as {
      companies: { data: { items: { id: string; missingCount: number }[] } };
      selected: { data: { companyId: string; missing: unknown[] } };
    };
    const card = body.companies.data.items.find(({ id }) => id === body.selected.data.companyId);
    // The prototype shows Chevron as "Sin indicadores faltantes — homologación completa".
    expect(card).toMatchObject({ id: 'cmp_chevron', missingCount: 0 });
    expect(body.selected.data.missing).toHaveLength(card?.missingCount ?? -1);
  });

  it('gives each analysis id a single title across V-03 home and V-04 analyses', async () => {
    const { client } = await authenticatedClient(mockApp());
    const home = contract('V-03').response.parse(
      (await client.get(endpointPath(contract('V-03')))).body,
    ) as { enabledAnalyses: { data: { id: string; targetRoute: string; title: string }[] } };
    const list = contract('V-04').response.parse(
      (await client.get(endpointPath(contract('V-04')))).body,
    ) as { items: { id: string; name: string }[] };

    const titles = new Map<string, Set<string>>();
    const named = [
      ...home.enabledAnalyses.data.map(({ id, title }) => [id, title] as const),
      ...list.items.map(({ id, name }) => [id, name] as const),
    ];
    for (const [id, title] of named) titles.set(id, (titles.get(id) ?? new Set()).add(title));
    expect([...titles].filter(([, names]) => names.size > 1)).toEqual([]);
    // A-04 analysisContext.defaultAnalysisId and the web e2e open ana_01J9Y8D4T2 as this analysis.
    expect(titles.get('ana_01J9Y8D4T2')).toEqual(new Set(['Desempeño comparativo — 4T 2025']));
    for (const { id, targetRoute } of home.enabledAnalyses.data) {
      expect(targetRoute).toContain(`/analisis/${id}/`);
    }
  });

  // The web V-36 contract example plots 6 axes (2 axes drew a line) with a top-3 / bottom-3 ranking.
  it('serves the V-36 radar with 6 axes and a top-3 / bottom-3 ranking', async () => {
    const { client } = await authenticatedClient(mockApp());
    const response = await client.get(endpointPath(contract('V-36')));

    expect(response.status).toBe(200);
    const body = contract('V-36').response.parse(response.body) as {
      radar: { data: { axes: unknown[]; series: { values: number[] }[] } };
      ranking: { data: { strengths: unknown[]; opportunities: unknown[] } };
    };
    expect(body.radar.data.axes).toHaveLength(6);
    for (const series of body.radar.data.series) expect(series.values).toHaveLength(6);
    expect(body.ranking.data.strengths).toHaveLength(3);
    expect(body.ranking.data.opportunities).toHaveLength(3);
  });

  it('gives the V-43 presentation detail the V-40 edit permission of prs_directorio_t4', async () => {
    const { client } = await authenticatedClient(mockApp());
    const list = contract('V-40').response.parse(
      (await client.get(endpointPath(contract('V-40')))).body,
    ) as { items: { id: string; permissions: { canEdit: boolean } }[] };
    const detail = contract('V-43').response.parse(
      (
        await client.get(
          contract('V-43').endpoint.path.replace(':presentationId', 'prs_directorio_t4'),
        )
      ).body,
    ) as { meta: { id: string }; permissions: { canEdit: boolean } };

    const listed = list.items.find(({ id }) => id === 'prs_directorio_t4');
    expect(detail.meta.id).toBe('prs_directorio_t4');
    expect(listed?.permissions.canEdit).toBe(true);
    expect(detail.permissions.canEdit).toBe(listed?.permissions.canEdit);
  });

  it('counts as many V-41 comments as the V-26 presentation thread holds', async () => {
    const { client } = await authenticatedClient(mockApp());
    const builder = contract('V-41').response.parse(
      (await client.get(endpointPath(contract('V-41')))).body,
    ) as { commentCount: number };
    const thread = contract('V-26').response.parse(
      (
        await client
          .get('/api/v1/views/comment-thread')
          .query({ entityId: 'prs_directorio_t4', entityType: 'presentation' })
      ).body,
    ) as { items: unknown[] };

    expect(thread.items).toHaveLength(2);
    expect(builder.commentCount).toBe(thread.items.length);
  });

  it('refuses to start when a mock example variant breaks its strict schema', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mock-examples-'));
    try {
      cpSync(join('src', 'presentation', 'http', 'routes', 'mock-examples'), directory, {
        recursive: true,
      });
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file inside this test's temp directory.
      writeFileSync(
        join(directory, 'V-26.presentation.response.json'),
        JSON.stringify({ items: [], page: 1, pageSize: 20, totalItems: 0, leaked: true }),
      );
      // A variant of an operation without a variant selector could never be served, so it is refused too.
      cpSync(
        join(directory, 'V-03.response.json'),
        join(directory, 'V-03.presentation.response.json'),
      );

      // Each load schema-validates every example, so load once and assert on that single error.
      let failure: unknown;
      try {
        createMockContractRouter(baseEnv, { fixtureDirectory: directory });
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(Error);
      const message = (failure as Error).message;
      expect(message).toMatch(/^Invalid mock contract examples: /);
      expect(message).toMatch(
        /V-03\.presentation: no registered operation with a variant selector/,
      );
      expect(message).toMatch(/V-26\.presentation: /);
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  it('keeps the static O-01 example for an unknown operation', async () => {
    const { client } = await authenticatedClient(mockApp());
    const response = await client.get('/api/v1/operations/op_unknown');
    expect(response.status).toBe(200);
    expect(contract('O-01').response.parse(response.body)).toMatchObject({
      id: 'op_01J9ZM0Q4A',
      result: null,
      status: 'running',
    });
  });
});
