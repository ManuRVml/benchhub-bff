import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { CONTRACT_SCHEMAS, listRegistry } from '../../../src/contracts/registry.js';
import { expectSectionVariants } from '../../helpers/expect-section-variants.js';
import { expectStrictRoundTrip } from '../../helpers/expect-strict-round-trip.js';

import type { ContractEntry } from '../../../src/contracts/registry.js';

// Generic contract test driven by tests/contract-examples/index.json (written by `pnpm contract:examples`): every
// registered contract must have an example, and every example of a registered contract must round-trip strictly
// through its schema. Rows only add entries to src/contracts/registry.ts; this file does not change per row.

interface ManifestEntry {
  id: string;
  kind: 'request' | 'response' | 'fragment';
  form: 'instance' | 'descriptor';
  file: string;
  sections: string[];
}

const EXAMPLES_DIR = fileURLToPath(new URL('../../contract-examples/', import.meta.url));

const readExample = (file: string): unknown =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- file names come from the committed manifest
  JSON.parse(readFileSync(join(EXAMPLES_DIR, file), 'utf8'));

const manifest = readExample('index.json') as ManifestEntry[];
const registered = Object.entries(CONTRACT_SCHEMAS);

/** Descriptor examples (placeholders such as `<string>`) are replaced by the row's concrete instance file. */
const exampleFileOf = (entry: ManifestEntry): string =>
  entry.form === 'descriptor' ? `${entry.id}.${entry.kind}.instance.json` : entry.file;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The schema an example is checked against: request, response, or for a fragment a strict partial response. When the
 * response is a union (V-23 scopes, C-33 SSE events) a fragment is one complete alternative, checked against the union.
 */
function schemaFor(contract: ContractEntry, kind: ManifestEntry['kind']): z.ZodType {
  if (kind === 'request') {
    if (!contract.request)
      throw new Error('the contract has a request example but no request schema');
    return contract.request;
  }
  if (kind === 'response') return contract.response;
  if (contract.response instanceof z.ZodObject) return contract.response.partial().strict();
  if (
    contract.response instanceof z.ZodDiscriminatedUnion ||
    contract.response instanceof z.ZodUnion
  ) {
    return contract.response;
  }
  throw new Error('a fragment example needs an object or union response schema');
}

describe('contract registry', () => {
  it.each(registered)('%s has real Zod schemas', (_id, entry) => {
    expect(typeof entry.response.parse).toBe('function');
    expect(entry.request === undefined || typeof entry.request.parse === 'function').toBe(true);
  });

  it.each(registered)('%s has endpoint metadata', (_id, entry) => {
    expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(entry.endpoint.method);
    expect(entry.endpoint.path).toMatch(/^\/api\/v1\/[\w\-/:]+$/);
    expect(entry.operationId).toMatch(/^[a-z][A-Za-z0-9]+$/);
  });

  it('has unique operationIds', () => {
    const ids = registered.map(([, entry]) => entry.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(registered.map(([id]) => id))('%s has an example in the manifest', (id) => {
    expect(manifest.filter((entry) => entry.id === id).length).toBeGreaterThan(0);
  });

  it('lists every entry with its endpoint, operationId, request/response flags and sections', () => {
    expect(listRegistry()['V-03']).toEqual({
      endpoint: { method: 'GET', path: '/api/v1/views/home' },
      operationId: 'getHomeView',
      request: false,
      response: true,
      sections: ['banner', 'executiveSummary', 'enabledAnalyses', 'peerNews', 'marketIndicators'],
    });
  });
});

describe.each(registered)('%s contract examples', (id, contract) => {
  const entries = manifest
    .filter((entry) => entry.id === id)
    .map((entry) => ({ ...entry, example: exampleFileOf(entry) }));

  it.each(entries)('$kind example $example round-trips strictly', (entry) => {
    expectStrictRoundTrip(schemaFor(contract, entry.kind), readExample(entry.example));
  });

  const withSections = entries
    .filter((entry) => entry.kind === 'response')
    .map((entry) => ({
      ...entry,
      sectionNames: [...new Set([...entry.sections, ...(contract.sections ?? [])])],
    }))
    .filter((entry) => entry.sectionNames.length > 0);

  it.each(withSections)(
    'response example $example accepts error and forbidden per section',
    (entry) => {
      const example = readExample(entry.example);
      if (!isPlainObject(example))
        throw new Error(`${entry.example} must be an object to carry sections`);
      expectSectionVariants(contract.response, example, entry.sectionNames);
    },
  );
});
