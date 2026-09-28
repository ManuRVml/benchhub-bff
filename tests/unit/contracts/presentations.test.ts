import { describe, expect, it } from 'vitest';

import { v40QuerySchema } from '../../../src/contracts/presentations/v-40-presentations.js';
import { v41ResponseSchema } from '../../../src/contracts/presentations/v-41-presentation-builder.js';
import {
  v42QuerySchema,
  v42ResponseSchema,
  v42SlideSchema,
} from '../../../src/contracts/presentations/v-42-presentation-slides.js';

// Round-trips of V-40..V-43 are covered by the generic manifest-driven test (registry.contract.test.ts); these are the
// prose rules the examples do not exercise.
const deck = (slides: unknown[]) => ({
  templateId: 'storytelling',
  templateName: 'Storytelling de Mercado',
  accentKey: 'template.storytelling',
  language: 'es',
  slides,
  permissions: { canReorder: false },
});

const base = {
  key: 'hallazgos|lista',
  label: 'Lista',
  moduleLabel: 'Hallazgos de IA',
  pageLabel: '2 / 3',
};

describe('V-40..V-43 presentation rules', () => {
  it('V-40 query: optional analysisId, page / pageSize defaults 1 / 20', () => {
    expect(v40QuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(v40QuerySchema.parse({ analysisId: 'ana_01J9Y8D4T2', page: '2' })).toEqual({
      analysisId: 'ana_01J9Y8D4T2',
      page: 2,
      pageSize: 20,
    });
    expect(v40QuerySchema.safeParse({ page: '0' }).success).toBe(false);
    expect(v40QuerySchema.safeParse({ status: 'draft' }).success).toBe(false);
  });

  it('V-41 notes are keyed moduleId|chartId and the template may be null', () => {
    const builder = {
      meta: { title: '', date: null, language: 'en', templateId: null },
      templates: [],
      includeCover: false,
      includeClosing: false,
      modules: [],
      slideCount: 0,
      notes: { 'comp|barras': 'Nota' },
      pendingNoteCount: 0,
      uploadedVersion: {
        fileName: 'Directorio_T4.pptx',
        sizeLabel: '2,4 MB',
        uploadedAt: '2025-10-05T09:30:00-05:00',
      },
      commentCount: 0,
      permissions: {},
    };
    expect(v41ResponseSchema.safeParse(builder).success).toBe(true);
    expect(v41ResponseSchema.safeParse({ ...builder, notes: { barras: 'Nota' } }).success).toBe(
      false,
    );
    expect(
      v41ResponseSchema.safeParse({ ...builder, meta: { ...builder.meta, language: 'pt' } })
        .success,
    ).toBe(false);
  });

  it('V-42 accepts the empty deck [{ kind: "empty" }] with no other member', () => {
    expect(v42ResponseSchema.safeParse(deck([{ kind: 'empty' }])).success).toBe(true);
    expect(v42SlideSchema.safeParse({ kind: 'empty', ...base }).success).toBe(false);
  });

  it('V-42 rejects an unknown kind and a member of another kind', () => {
    expect(v42SlideSchema.safeParse({ ...base, kind: 'chart' }).success).toBe(false);
    expect(
      v42SlideSchema.safeParse({ ...base, kind: 'appendix', supportEmail: 'x@y.co', title: 'T' })
        .success,
    ).toBe(false);
  });

  it('V-42 hallazgos: at most 5 findings, always a suggestion', () => {
    const findings = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ text: `H${String(i)}` }));
    const hallazgos = { ...base, kind: 'hallazgos', status: 'suggestion', findings: findings(5) };
    expect(v42SlideSchema.safeParse(hallazgos).success).toBe(true);
    expect(v42SlideSchema.safeParse({ ...hallazgos, findings: findings(6) }).success).toBe(false);
    expect(v42SlideSchema.safeParse({ ...hallazgos, status: 'accepted' }).success).toBe(false);
  });

  it('V-42 pageLabel is "{n} / {total}" and weight totals may exceed 100 (CF-65)', () => {
    const findingsSlide = {
      ...base,
      kind: 'findings',
      rows: [
        {
          companyName: 'TotalEnergies',
          financieraPct: 62,
          operativaPct: 20,
          transversalPct: 24,
          totalPct: 106,
        },
      ],
    };
    expect(v42SlideSchema.safeParse(findingsSlide).success).toBe(true);
    expect(v42SlideSchema.safeParse({ ...findingsSlide, pageLabel: '2/3' }).success).toBe(false);
  });

  it('V-42 query: order is a comma list of slide keys, empty = saved order', () => {
    expect(v42QuerySchema.parse({})).toEqual({ order: [] });
    expect(v42QuerySchema.parse({ order: 'title,comp|barras,appendix' })).toEqual({
      order: ['title', 'comp|barras', 'appendix'],
    });
    expect(v42QuerySchema.safeParse({ order: 'title,,appendix' }).success).toBe(false);
  });
});
