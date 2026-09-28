import { describe, expect, it } from 'vitest';

import { v04QuerySchema } from '../../../src/contracts/analyses/v-04-analyses.js';
import { v05QuerySchema } from '../../../src/contracts/analysis-definition/v-05-analysis-definition.js';
import { v06QuerySchema } from '../../../src/contracts/catalogs/v-06-competitor-catalog.js';
import { v07QuerySchema } from '../../../src/contracts/catalogs/v-07-indicator-catalog.js';
import { CONTRACT_SCHEMAS } from '../../../src/contracts/registry.js';
import { v09QuerySchema } from '../../../src/contracts/results/v-09-results-header.js';
import { v10QuerySchema } from '../../../src/contracts/results/v-10-company-coverage.js';
import { v11QuerySchema } from '../../../src/contracts/results/v-11-peer-average-comparison.js';
import { v12QuerySchema } from '../../../src/contracts/results/v-12-company-comparison.js';
import { v13QuerySchema } from '../../../src/contracts/results/v-13-report-summary.js';
import { v14QuerySchema } from '../../../src/contracts/results/v-14-ai-findings.js';

import type { z } from 'zod';

// Query parameters of the GET views V-04..V-14 (P3-04q). Query values arrive as strings (Express `req.query`), so the
// valid queries below are strings too. V-08 has only a path param and no query schema.

interface QueryCase {
  id: string;
  schema: z.ZodType;
  defaults: Record<string, unknown>;
  full: Record<string, string>;
  parsedFull: Record<string, unknown>;
  invalid: Record<string, string>;
}

const REGISTRY = new Map(Object.entries(CONTRACT_SCHEMAS));

const CASES: QueryCase[] = [
  {
    id: 'V-04',
    schema: v04QuerySchema,
    defaults: { q: '', page: 1, pageSize: 20 },
    full: {
      q: 'roace',
      createdOn: '2025-11-03',
      createdBy: 'usr_ana',
      status: 'in_review',
      ref: 'tbg-ilp',
      page: '2',
      pageSize: '20',
    },
    parsedFull: {
      q: 'roace',
      createdOn: '2025-11-03',
      createdBy: 'usr_ana',
      status: 'in_review',
      ref: 'tbg-ilp',
      page: 2,
      pageSize: 20,
    },
    invalid: { status: 'archived' },
  },
  {
    id: 'V-05',
    schema: v05QuerySchema,
    defaults: { step: 1 },
    full: { step: '5' },
    parsedFull: { step: 5 },
    invalid: { step: '6' },
  },
  {
    id: 'V-06',
    schema: v06QuerySchema,
    defaults: { businessLine: 'all' },
    full: { businessLine: 'energeticos' },
    parsedFull: { businessLine: 'energeticos' },
    invalid: { businessLine: 'mineria' },
  },
  {
    id: 'V-07',
    schema: v07QuerySchema,
    defaults: { source: 'pares', concepts: [], horizons: [] },
    full: { source: 'pares', concepts: 'rentabilidad,liquidez', horizons: '' },
    parsedFull: { source: 'pares', concepts: ['rentabilidad', 'liquidez'], horizons: [] },
    invalid: { concepts: 'rentabilidad,ventas' },
  },
  {
    id: 'V-09',
    schema: v09QuerySchema,
    defaults: { horizon: 'tbg' },
    full: { horizon: 'union' },
    parsedFull: { horizon: 'union' },
    invalid: { horizon: 'tbg-ilp' },
  },
  {
    id: 'V-10',
    schema: v10QuerySchema,
    defaults: { horizon: 'tbg' },
    full: { horizon: 'ilp', companyId: 'cmp_shell' },
    parsedFull: { horizon: 'ilp', companyId: 'cmp_shell' },
    invalid: { horizon: 'union' },
  },
  {
    id: 'V-11',
    schema: v11QuerySchema,
    defaults: { horizon: 'tbg', category: 'rentabilidad' },
    full: { horizon: 'ilp', category: 'liquidez' },
    parsedFull: { horizon: 'ilp', category: 'liquidez' },
    invalid: { category: '' },
  },
  {
    id: 'V-12',
    schema: v12QuerySchema,
    defaults: { horizon: 'tbg' },
    full: { horizon: 'union', companyId: 'cmp_chevron' },
    parsedFull: { horizon: 'union', companyId: 'cmp_chevron' },
    invalid: { companyId: '' },
  },
  {
    id: 'V-13',
    schema: v13QuerySchema,
    defaults: { horizon: 'tbg', categories: [] },
    full: { horizon: 'ilp', categories: 'rentabilidad,solvencia' },
    parsedFull: { horizon: 'ilp', categories: ['rentabilidad', 'solvencia'] },
    invalid: { categories: 'rentabilidad,,solvencia' },
  },
  {
    id: 'V-14',
    schema: v14QuerySchema,
    defaults: { horizon: 'tbg' },
    full: { horizon: 'ilp' },
    parsedFull: { horizon: 'ilp' },
    invalid: { horizon: 'all' },
  },
];

describe.each(CASES)('$id query', ({ id, schema, defaults, full, parsedFull, invalid }) => {
  it('is the registered request (published as query parameters)', () => {
    expect(REGISTRY.get(id)?.request).toBe(schema);
  });

  it('parses {} to the documented defaults', () => {
    expect(schema.parse({})).toEqual(defaults);
  });

  it('parses a full string query', () => {
    expect(schema.parse(full)).toEqual(parsedFull);
  });

  it('rejects an invalid value', () => {
    expect(schema.safeParse(invalid).success).toBe(false);
  });

  it('rejects an unknown parameter (.strict())', () => {
    expect(schema.safeParse({ unknownParam: 'x' }).success).toBe(false);
  });
});

describe('query value rules', () => {
  it('V-04 page / pageSize are positive integers', () => {
    for (const page of ['0', '-1', '1.5', 'abc', '']) {
      expect(v04QuerySchema.safeParse({ page }).success).toBe(false);
    }
    expect(v04QuerySchema.safeParse({ createdOn: '03/11/2025' }).success).toBe(false);
  });

  it('V-05 step is an integer 1..5', () => {
    for (const step of ['0', '2.5', 'x']) {
      expect(v05QuerySchema.safeParse({ step }).success).toBe(false);
    }
    expect(v05QuerySchema.parse({ step: '1' })).toEqual({ step: 1 });
  });

  it('V-07 horizons accept tbg | ilp only', () => {
    expect(v07QuerySchema.parse({ source: 'tbg_ilp', horizons: 'ilp' })).toEqual({
      source: 'tbg_ilp',
      concepts: [],
      horizons: ['ilp'],
    });
    expect(v07QuerySchema.safeParse({ horizons: 'union' }).success).toBe(false);
    expect(v07QuerySchema.safeParse({ source: 'otra' }).success).toBe(false);
  });

  it('V-13 rejects union (the module is hidden there)', () => {
    expect(v13QuerySchema.safeParse({ horizon: 'union' }).success).toBe(false);
  });

  it('V-08 declares no query parameters', () => {
    expect(REGISTRY.get('V-08')?.request).toBeUndefined();
  });
});
