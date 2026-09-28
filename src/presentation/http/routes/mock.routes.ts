import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { json, Router, type Request, type Response } from 'express';

import { CONTRACT_SCHEMAS, type ContractEntry } from '../../../contracts/registry.js';
import { a05RequestSchema } from '../../../contracts/session/a-05-password-login.js';
import { HttpError } from '../errors/api-error.js';

const SESSION_COOKIE = 'eco_mock_session';
const CSRF_HEADER = 'x-csrf-token';
const ACCEPTED_OPERATIONS = new Set(['C-03', 'C-08', 'C-14']);
const CREATED_OPERATIONS = new Set([
  'C-01',
  'C-04',
  'C-10',
  'C-12',
  'C-18',
  'C-19',
  'C-25',
  'C-27',
  'C-38',
  'C-41',
]);

type MockRole =
  | 'analyst_creator'
  | 'explorer_viewer'
  | 'explorer_integral'
  | 'executive_viewer'
  | 'executive_integral';

interface MockRouterConfig {
  readonly MOCK_LATENCY_MS: number;
  readonly MOCK_LOGIN_PASSWORD: string;
  readonly MOCK_LOGIN_USERNAME: string;
  readonly MOCK_ROLE: MockRole;
  readonly MOCK_SCENARIO: 'default' | 'empty' | 'error' | 'slow' | 'partial' | 'forbidden';
  readonly NODE_ENV: 'development' | 'test' | 'production';
}

interface MockSession {
  csrfToken: string;
  role: MockRole;
  savedDraftIds: Set<string>;
}

type MockOperationKind = 'analysis_generation' | 'recalculation' | 'export';

interface MockOperation {
  fileId?: string;
  fileName?: string;
  id: string;
  kind: MockOperationKind;
  polls: number;
  targetRoute?: string;
}

interface MockFile {
  fileName: string;
  operationId: string;
}

interface MockRouterOptions {
  /** Keeps API-E2E fixture loading explicit without changing the production container path. */
  fixtureDirectory?: string;
}

function fixtureDirectory(configured?: string): string {
  const candidates = [
    configured,
    resolve(process.cwd(), 'mock-examples'),
    resolve(process.cwd(), 'src/presentation/http/routes/mock-examples'),
  ].filter((candidate): candidate is string => candidate !== undefined);
  const directory = candidates.find(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the candidate comes from fixed local paths.
    (candidate) => existsSync(candidate),
  );
  if (directory === undefined) {
    throw new Error(
      'Mock contract examples are unavailable; expected mock-examples beside the application bundle',
    );
  }
  return directory;
}

/**
 * Operations whose example depends on a request query value. A file `<ID>.<variant>.response.json` is served when the
 * query parameter named here equals `<variant>`; any other value falls back to `<ID>.response.json`.
 */
export const MOCK_EXAMPLE_VARIANT_QUERY: ReadonlyMap<string, string> = new Map([
  // V-26 threads differ per commented entity: `entityType=presentation` serves V-26.presentation.response.json.
  ['V-26', 'entityType'],
  // V-11 rows belong to one category tab: `category=liquidez` serves V-11.liquidez.response.json (default Rentabilidad).
  ['V-11', 'category'],
  // V-21 ranks one dimension: `dimension=op` serves V-21.op.response.json (default `fin`).
  ['V-21', 'dimension'],
]);
export const MOCK_EXAMPLE_VARIANT_FILE = /^([A-Z]-\d{2})\.([a-z][a-z0-9_]*)\.response\.json$/;

function variantKey(id: string, variant: string): string {
  return `${id}.${variant}`;
}

function baseExampleId(key: string): string {
  return key.split('.')[0] ?? key;
}

function loadExample(entry: ContractEntry, fixture: string): unknown {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixtures are registry IDs or matched variant names in the fixture directory.
  const example = JSON.parse(readFileSync(fixture, 'utf8')) as unknown;
  const parsed = entry.response.safeParse(example);
  if (!parsed.success)
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  return parsed.data;
}

function loadExamples(directory: string): Map<string, unknown> {
  const examples = new Map<string, unknown>();
  const invalid: string[] = [];
  const load = (key: string, entry: ContractEntry | undefined, file: string): void => {
    try {
      if (entry === undefined) throw new Error('no registered operation with a variant selector');
      examples.set(key, loadExample(entry, join(directory, file)));
    } catch (error) {
      invalid.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  for (const [id, entry] of Object.entries(CONTRACT_SCHEMAS))
    load(id, entry, `${id}.response.json`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the directory comes from fixed local paths.
  for (const file of readdirSync(directory)) {
    const match = MOCK_EXAMPLE_VARIANT_FILE.exec(file);
    if (match?.[1] === undefined || match[2] === undefined) continue;
    const selectable = MOCK_EXAMPLE_VARIANT_QUERY.has(match[1]);
    load(variantKey(match[1], match[2]), selectable ? registryEntry(match[1]) : undefined, file);
  }

  if (invalid.length > 0) {
    throw new Error(`Invalid mock contract examples: ${invalid.join('; ')}`);
  }
  return examples;
}

function selectedExample(
  examples: ReadonlyMap<string, unknown>,
  id: string,
  req: Request,
): unknown {
  const parameter = MOCK_EXAMPLE_VARIANT_QUERY.get(id);
  const variant: unknown = parameter === undefined ? undefined : Reflect.get(req.query, parameter);
  const example = typeof variant === 'string' ? examples.get(variantKey(id, variant)) : undefined;
  return example ?? examples.get(id);
}

function responseStatus(id: string): number {
  if (id === 'A-03') return 204;
  if (ACCEPTED_OPERATIONS.has(id)) return 202;
  if (CREATED_OPERATIONS.has(id)) return 201;
  return 200;
}

function isUnsafe(entry: ContractEntry): boolean {
  return entry.endpoint.method !== 'GET';
}

function validateRequest(entry: ContractEntry, req: Request): void {
  if (entry.request === undefined) return;
  const input: unknown =
    entry.endpoint.method === 'GET' ? req.query : ((req.body as unknown) ?? {});
  if (!entry.request.safeParse(input).success) {
    throw new HttpError(400, 'BAD_REQUEST', 'The request could not be processed');
  }
}

function contract(id: string): ContractEntry {
  const found = Object.entries(CONTRACT_SCHEMAS).find(([candidate]) => candidate === id);
  if (found === undefined) throw new Error(`Mock contract is missing ${id}`);
  return found[1];
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((done) => setTimeout(done, milliseconds));
}

function safeReturnTo(value: unknown): string {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) ? value : '/';
}

function cloneExample(example: unknown): unknown {
  return structuredClone(example);
}

type PathSegment = string | number;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exampleRecord(
  examples: ReadonlyMap<string, unknown>,
  id: string,
): Record<string, unknown> {
  const example = examples.get(id);
  if (!isRecord(example)) throw new Error(`Mock example ${id} must be an object`);
  return cloneExample(example) as Record<string, unknown>;
}

function operationKindForCommand(id: string): MockOperationKind | undefined {
  switch (id) {
    case 'C-03':
      return 'analysis_generation';
    case 'C-08':
      return 'recalculation';
    case 'C-14':
      return 'export';
    default:
      return undefined;
  }
}

function exportFileName(req: Request, serial: number): string {
  const body = isRecord(req.body) ? req.body : {};
  const kind = typeof body.kind === 'string' ? body.kind : 'export';
  const extension = kind.endsWith('-xlsx')
    ? 'xlsx'
    : kind.endsWith('-pdf')
      ? 'pdf'
      : kind.endsWith('-pptx')
        ? 'pptx'
        : kind.endsWith('-png')
          ? 'png'
          : 'txt';
  return `mock-${kind}-${String(serial)}.${extension}`;
}

function operationResult(operation: MockOperation): Record<string, string> {
  if (operation.kind === 'export') {
    if (operation.fileId === undefined || operation.fileName === undefined) {
      throw new Error(`Mock export ${operation.id} is missing a file result`);
    }
    return { fileId: operation.fileId, fileName: operation.fileName };
  }
  if (operation.targetRoute === undefined) {
    throw new Error(`Mock operation ${operation.id} is missing a target route`);
  }
  return { targetRoute: operation.targetRoute };
}

function operationStatusResponse(
  operation: MockOperation,
  status: 'running' | 'succeeded' | 'failed',
): Record<string, unknown> {
  if (status === 'running') {
    return {
      error: null,
      id: operation.id,
      kind: operation.kind,
      messageKey: 'operation.mock.running',
      progressPct: 45,
      result: null,
      status,
    };
  }
  if (status === 'failed') {
    return {
      error: { code: 'MOCK_OPERATION_FAILED', messageKey: 'operation.mock.failed' },
      id: operation.id,
      kind: operation.kind,
      messageKey: 'operation.mock.failed',
      progressPct: 100,
      result: null,
      status,
    };
  }
  return {
    error: null,
    id: operation.id,
    kind: operation.kind,
    messageKey: 'operation.mock.succeeded',
    progressPct: 100,
    result: operationResult(operation),
    status,
  };
}

function operationEvent(
  operation: MockOperation,
  status: 'running' | 'succeeded' | 'failed',
): Record<string, unknown> {
  if (status === 'running') {
    return {
      messageKey: 'operation.mock.running',
      operationId: operation.id,
      progressPct: 45,
      status,
    };
  }
  if (status === 'failed') {
    return {
      error: { code: 'MOCK_OPERATION_FAILED', messageKey: 'operation.mock.failed' },
      messageKey: 'operation.mock.failed',
      operationId: operation.id,
      progressPct: 100,
      status,
    };
  }
  return {
    messageKey: 'operation.mock.succeeded',
    operationId: operation.id,
    progressPct: 100,
    result: operationResult(operation),
    status,
  };
}

function arrayPaths(value: unknown, path: readonly PathSegment[] = []): PathSegment[][] {
  if (Array.isArray(value)) {
    return [[...path], ...value.flatMap((item, index) => arrayPaths(item, [...path, index]))];
  }
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, item]) => arrayPaths(item, [...path, key]));
}

function recordValue(record: Record<string, unknown>, key: string): unknown {
  return Object.entries(record)
    .find(([candidate]) => candidate === key)
    ?.at(1);
}

function withRecordValue(
  record: Record<string, unknown>,
  key: string,
  value: unknown,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([candidate, current]) =>
      candidate === key ? [candidate, value] : [candidate, current],
    ),
  );
}

function emptyArrayAtPath(value: unknown, path: readonly PathSegment[]): unknown {
  if (path.length === 0) return Array.isArray(value) ? [] : value;
  const segment = path.at(0);
  if (segment === undefined) return value;
  const remaining = path.slice(1);
  if (Array.isArray(value) && typeof segment === 'number') {
    const items: readonly unknown[] = value;
    return items.map((item, index) =>
      index === segment ? emptyArrayAtPath(item, remaining) : item,
    );
  }
  if (isRecord(value) && typeof segment === 'string') {
    return withRecordValue(
      value,
      segment,
      emptyArrayAtPath(recordValue(value, segment), remaining),
    );
  }
  return value;
}

function emptySchemaCompatibleArrays(entry: ContractEntry, example: unknown): unknown {
  let candidate = cloneExample(example);
  for (const path of arrayPaths(candidate)) {
    const next = emptyArrayAtPath(candidate, path);
    if (entry.response.safeParse(next).success) candidate = next;
  }
  return candidate;
}

function emptySectionResults(entry: ContractEntry, example: unknown): unknown {
  const initial = cloneExample(example);
  if (!isRecord(initial)) return initial;
  let candidate = initial;

  for (const sectionName of entry.sections ?? []) {
    const section = recordValue(candidate, sectionName);
    if (!isRecord(section) || section.status !== 'ok') continue;
    const next = withRecordValue(candidate, sectionName, { status: 'empty' });
    if (entry.response.safeParse(next).success) candidate = next;
  }

  return emptySchemaCompatibleArrays(entry, candidate);
}

function partialSectionResult(entry: ContractEntry, example: unknown): unknown {
  const candidate = cloneExample(example);
  if (!isRecord(candidate)) return candidate;
  const sectionName = entry.sections?.find((name) => {
    const section = recordValue(candidate, name);
    return isRecord(section) && section.status === 'ok' && 'data' in section;
  });
  if (sectionName !== undefined) {
    return withRecordValue(candidate, sectionName, {
      status: 'error',
      errorCode: 'MOCK_SCENARIO_PARTIAL',
    });
  }
  return candidate;
}

function registryEntry(id: string): ContractEntry | undefined {
  const found = Object.entries(CONTRACT_SCHEMAS).find(([candidate]) => candidate === id);
  if (found === undefined) return undefined;
  const [, entry] = found;
  return entry;
}

function scenarioExamples(
  examples: ReadonlyMap<string, unknown>,
  scenario: MockRouterConfig['MOCK_SCENARIO'],
): Map<string, unknown> {
  if (scenario !== 'empty' && scenario !== 'partial') return new Map(examples);

  const transformed = new Map<string, unknown>();
  const fallbacks: string[] = [];
  for (const [id, example] of examples) {
    const entry = registryEntry(baseExampleId(id));
    if (!id.startsWith('V-') || entry === undefined) {
      transformed.set(id, example);
      continue;
    }
    const candidate =
      scenario === 'partial'
        ? partialSectionResult(entry, example)
        : emptySectionResults(entry, example);
    const parsed = entry.response.safeParse(candidate);
    if (!parsed.success) {
      fallbacks.push(id);
      transformed.set(id, example);
      continue;
    }
    transformed.set(id, parsed.data);
  }

  if (fallbacks.length > 0) {
    process.emitWarning(
      `Mock ${scenario} scenario used unmodified examples for: ${fallbacks.join(', ')}`,
      { code: 'MOCK_SCENARIO_FALLBACK', type: 'MockScenarioFallback' },
    );
  }
  return transformed;
}

function sendSession(res: Response, example: unknown, session: MockSession): void {
  const payload = cloneExample(example) as Record<string, unknown>;
  payload.role = session.role;
  payload.csrfToken = session.csrfToken;
  res.set('Cache-Control', 'no-store').status(200).json(payload);
}

function setSseHeaders(res: Response): void {
  res.set({
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream; charset=utf-8',
    'X-Accel-Buffering': 'no',
  });
}

function assistantTokenParts(example: unknown): readonly string[] {
  const content =
    isRecord(example) && typeof example.content === 'string' ? example.content : undefined;
  const answer =
    content && content.length > 0 ? content : 'Yarbis encontró hallazgos en el análisis.';
  const midpoint = Math.max(1, Math.ceil(answer.length / 2));
  return [answer.slice(0, midpoint), answer.slice(midpoint)].filter((part) => part.length > 0);
}

/**
 * Constant-time string equality: both sides are hashed first, so timingSafeEqual always compares 32-byte buffers and
 * neither the content nor the length of the secret leaks through timing.
 */
function constantTimeEquals(candidate: string, expected: string): boolean {
  const digest = (value: string): Buffer => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(digest(candidate), digest(expected));
}

/** A-05: username case-insensitive after trim, password exact; both are always compared (no early exit). */
function credentialsMatch(
  env: Pick<MockRouterConfig, 'MOCK_LOGIN_PASSWORD' | 'MOCK_LOGIN_USERNAME'>,
  username: string,
  password: string,
): boolean {
  const usernameMatches = constantTimeEquals(
    username.trim().toLowerCase(),
    env.MOCK_LOGIN_USERNAME.trim().toLowerCase(),
  );
  const passwordMatches = constantTimeEquals(password, env.MOCK_LOGIN_PASSWORD);
  return usernameMatches && passwordMatches;
}

function sessionId(req: Request): string | undefined {
  const cookies: unknown = req.cookies;
  if (typeof cookies !== 'object' || cookies === null) return undefined;
  const candidate: unknown = Reflect.get(cookies, SESSION_COOKIE);
  return typeof candidate === 'string' ? candidate : undefined;
}

/**
 * Serves every registered BFF operation using response examples that are schema-validated when the router is composed.
 * The router is intentionally local-only: main.ts mounts it only for PROVIDERS_DEFAULT=mock.
 */
export function createMockContractRouter(
  env: MockRouterConfig,
  options: MockRouterOptions = {},
): Router {
  const examples = scenarioExamples(
    loadExamples(fixtureDirectory(options.fixtureDirectory)),
    env.MOCK_SCENARIO,
  );
  const router = Router();
  const sessions = new Map<string, MockSession>();
  const loginTransactions = new Map<string, string>();
  const operations = new Map<string, MockOperation>();
  const files = new Map<string, MockFile>();
  let operationSerial = 0;
  const latency = env.MOCK_LATENCY_MS || (env.MOCK_SCENARIO === 'slow' ? 250 : 0);

  router.use(json());

  /** A new mock session (cookie + synchronizer CSRF token), shared by the A-02 callback and the A-05 password login. */
  const establishSession = (res: Response): MockSession => {
    const id = randomBytes(32).toString('hex');
    const session: MockSession = {
      csrfToken: randomBytes(24).toString('hex'),
      role: env.MOCK_ROLE,
      savedDraftIds: new Set<string>(),
    };
    sessions.set(id, session);
    res.cookie(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    });
    return session;
  };

  router.get('/api/v1/auth/login', (req, res) => {
    validateRequest(contract('A-01'), req);
    const returnTo = safeReturnTo(req.query.returnTo);
    const state = randomBytes(16).toString('hex');
    loginTransactions.set(state, returnTo);
    res.redirect(302, `/api/v1/auth/callback?code=mock-code&state=${state}`);
  });

  router.get('/api/v1/auth/callback', (req, res) => {
    validateRequest(contract('A-02'), req);
    const state = req.query.state;
    const returnTo = typeof state === 'string' ? (loginTransactions.get(state) ?? '/') : '/';
    if (typeof state === 'string') loginTransactions.delete(state);
    establishSession(res);
    res.redirect(302, returnTo);
  });

  // A-05: public like A-01/A-02 (no session, no CSRF: it is the login); the app-wide rate limiter still applies.
  router.post('/api/v1/auth/password-login', (req, res) => {
    const parsed = a05RequestSchema.safeParse((req.body as unknown) ?? {});
    if (!parsed.success) {
      throw new HttpError(400, 'BAD_REQUEST', 'The request could not be processed');
    }
    if (!credentialsMatch(env, parsed.data.username, parsed.data.password)) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'The username or password is incorrect');
    }
    sendSession(res, examples.get('A-05'), establishSession(res));
  });

  const sessionFor = (req: Request): MockSession | undefined => {
    const id = sessionId(req);
    return id === undefined ? undefined : sessions.get(id);
  };

  const requireSession = (req: Request): MockSession => {
    const session = sessionFor(req);
    if (session === undefined) {
      throw new HttpError(401, 'UNAUTHENTICATED', 'A valid session is required');
    }
    return session;
  };

  const requireCsrf = (req: Request, session: MockSession): MockSession => {
    if (req.get(CSRF_HEADER) !== session.csrfToken) {
      throw new HttpError(403, 'CSRF_INVALID', 'CSRF token is missing or invalid');
    }
    return session;
  };

  router.post('/api/v1/auth/logout', (req, res) => {
    const session = requireSession(req);
    requireCsrf(req, session);
    const id = sessionId(req);
    if (id !== undefined) sessions.delete(id);
    res.clearCookie(SESSION_COOKIE).status(204).end();
  });

  router.get('/api/v1/session', (req, res) => {
    const session = sessionFor(req);
    if (session === undefined) {
      throw new HttpError(401, 'UNAUTHENTICATED', 'A valid session is required');
    }
    sendSession(res, examples.get('A-04'), session);
  });

  for (const [id, entry] of Object.entries(CONTRACT_SCHEMAS)) {
    if (id === 'A-01' || id === 'A-02' || id === 'A-03' || id === 'A-04' || id === 'A-05') continue;

    const handler = async (req: Request, res: Response): Promise<void> => {
      const session = requireSession(req);
      if (isUnsafe(entry)) requireCsrf(req, session);
      validateRequest(entry, req);
      if (latency > 0) await delay(latency);
      if (env.MOCK_SCENARIO === 'error' && id.startsWith('V-')) {
        throw new HttpError(500, 'MOCK_SCENARIO_ERROR', 'Mock scenario error');
      }
      if (env.MOCK_SCENARIO === 'forbidden' && id.startsWith('V-')) {
        throw new HttpError(403, 'FORBIDDEN', 'Mock scenario forbids this view');
      }
      if (id === 'C-33') {
        setSseHeaders(res);
        if (env.MOCK_SCENARIO === 'error') {
          res.write('data: {"type":"error","errorCode":"ASSISTANT_UNAVAILABLE"}\n\n');
          res.end();
          return;
        }
        for (const content of assistantTokenParts(examples.get(id))) {
          res.write(`data: ${JSON.stringify({ content, type: 'token' })}\n\n`);
        }
        const messageId = `msg_mock_${randomBytes(8).toString('hex')}`;
        res.write(`data: ${JSON.stringify({ messageId, type: 'done' })}\n\n`);
        res.end();
        return;
      }
      if (id === 'O-02') {
        const operationId = req.params.operationId;
        const operation = typeof operationId === 'string' ? operations.get(operationId) : undefined;
        setSseHeaders(res);
        if (operation !== undefined) {
          const finalStatus = env.MOCK_SCENARIO === 'error' ? 'failed' : 'succeeded';
          if (
            finalStatus === 'succeeded' &&
            operation.fileId !== undefined &&
            operation.fileName !== undefined
          ) {
            files.set(operation.fileId, {
              fileName: operation.fileName,
              operationId: operation.id,
            });
          }
          contract('O-02').response.parse(operationEvent(operation, 'running'));
          contract('O-02').response.parse(operationEvent(operation, finalStatus));
          res.write(
            `event: progress\ndata: ${JSON.stringify(operationEvent(operation, 'running'))}\n\n`,
          );
          res.write(
            `event: done\ndata: ${JSON.stringify(operationEvent(operation, finalStatus))}\n\n`,
          );
          res.end();
          return;
        }
        res.write(`data: ${JSON.stringify(examples.get(id))}\n\n`);
        res.end();
        return;
      }
      if (id === 'O-03') {
        const fileId = req.params.fileId;
        const file = typeof fileId === 'string' ? files.get(fileId) : undefined;
        if (file !== undefined) {
          res.attachment(file.fileName);
          res.set('Content-Type', 'application/octet-stream');
          res.send(`mock export ${file.operationId}`);
          return;
        }
        res.attachment('mock-file.txt');
        res.set('Content-Type', 'application/octet-stream');
        res.send('mock file');
        return;
      }
      if (id === 'O-01') {
        const operationId = req.params.operationId;
        const operation = typeof operationId === 'string' ? operations.get(operationId) : undefined;
        if (operation !== undefined) {
          operation.polls += 1;
          const status =
            operation.polls === 1
              ? 'running'
              : env.MOCK_SCENARIO === 'error'
                ? 'failed'
                : 'succeeded';
          if (
            status === 'succeeded' &&
            operation.fileId !== undefined &&
            operation.fileName !== undefined
          ) {
            files.set(operation.fileId, {
              fileName: operation.fileName,
              operationId: operation.id,
            });
          }
          const response = operationStatusResponse(operation, status);
          contract('O-01').response.parse(response);
          res.status(200).json(response);
          return;
        }
      }

      if (id === 'V-08' && env.MOCK_SCENARIO === 'default') {
        const draftId = req.params.draftId;
        if (typeof draftId === 'string' && session.savedDraftIds.has(draftId)) {
          const response = exampleRecord(examples, id);
          response.permissions = { canGenerate: true };
          contract(id).response.parse(response);
          res.status(200).json(response);
          return;
        }
      }

      const operationKind = operationKindForCommand(id);
      if (operationKind !== undefined) {
        operationSerial += 1;
        const operationId = `op_mock_${String(operationSerial)}`;
        const operation: MockOperation = {
          id: operationId,
          kind: operationKind,
          polls: 0,
          ...(operationKind === 'export'
            ? {
                fileId: `fil_mock_${String(operationSerial)}`,
                fileName: exportFileName(req, operationSerial),
              }
            : {
                targetRoute: `/analisis/${String(req.params.draftId ?? 'ana_mock')}/resultados`,
              }),
        };
        operations.set(operation.id, operation);
        const response = exampleRecord(examples, id);
        response.operationId = operation.id;
        contract(id).response.parse(response);
        res.status(responseStatus(id)).json(response);
        return;
      }

      if (id === 'C-02') {
        const draftId = req.params.draftId;
        if (typeof draftId === 'string') session.savedDraftIds.add(draftId);
      }
      res.status(responseStatus(id)).json(cloneExample(selectedExample(examples, id, req)));
    };

    switch (entry.endpoint.method) {
      case 'GET':
        router.get(entry.endpoint.path, handler);
        break;
      case 'POST':
        router.post(entry.endpoint.path, handler);
        break;
      case 'PUT':
        router.put(entry.endpoint.path, handler);
        break;
      case 'PATCH':
        router.patch(entry.endpoint.path, handler);
        break;
      case 'DELETE':
        router.delete(entry.endpoint.path, handler);
        break;
    }
  }

  return router;
}

export const mockContractStatus = responseStatus;
export const mockSessionCookieName = SESSION_COOKIE;
export const mockCsrfHeaderName = CSRF_HEADER;
