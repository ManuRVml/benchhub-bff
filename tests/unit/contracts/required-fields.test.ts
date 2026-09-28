import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { CONTRACT_SCHEMAS } from '../../../src/contracts/registry.js';

// Generic negative test driven by tests/contract-examples/index.json: for every registered contract with a request
// example and an object request schema, the example without one required top-level key must be rejected. A key is
// required when its field does not accept `undefined` (neither optional nor defaulted).

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

/** Descriptor examples (placeholders such as `<string>`) are replaced by the row's concrete instance file. */
const exampleFileOf = (entry: ManifestEntry): string =>
  entry.form === 'descriptor' ? `${entry.id}.${entry.kind}.instance.json` : entry.file;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

interface RequestCase {
  id: string;
  schema: z.ZodObject;
  example: Record<string, unknown>;
  requiredKeys: string[];
}

const requestCases: RequestCase[] = [];
for (const [id, contract] of Object.entries(CONTRACT_SCHEMAS)) {
  const schema = contract.request;
  if (!(schema instanceof z.ZodObject)) continue;
  const entry = manifest.find((item) => item.id === id && item.kind === 'request');
  if (!entry) continue;
  const example = readExample(exampleFileOf(entry));
  if (!isPlainObject(example)) continue;
  const shape: Readonly<Record<string, z.ZodType>> = schema.shape;
  const requiredKeys = Object.entries(shape)
    .filter(([, field]) => !field.safeParse(undefined).success)
    .map(([key]) => key);
  if (requiredKeys.length) requestCases.push({ id, schema, example, requiredKeys });
}

describe('required request fields', () => {
  it('finds request examples to check', () => {
    expect(requestCases.length).toBeGreaterThan(0);
  });

  describe.each(requestCases)('$id', ({ id, schema, example, requiredKeys }) => {
    it('accepts the complete example', () => {
      expect(schema.safeParse(example).success).toBe(true);
    });

    it.each(requiredKeys)(`${id} request without %s is rejected`, (key) => {
      const copy = Object.fromEntries(Object.entries(example).filter(([name]) => name !== key));
      expect(schema.safeParse(copy).success).toBe(false);
    });
  });
});
