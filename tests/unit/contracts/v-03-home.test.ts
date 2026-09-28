import { describe, expect, it } from 'vitest';

import { v03ResponseSchema } from '../../../src/contracts/views/v-03-home.js';

// Response example of web@a5e3012 docs/design/view-data-contracts/V-03-home.md, verbatim.
const V03_EXAMPLE = {
  banner: {
    status: 'ok',
    data: {
      text: 'Detecté 3 cambios relevantes en el sector durante las últimas 24 horas: caída de margen en Shell, alza de producción en Chevron y una noticia crítica de ISA que bloquea 3 indicadores.',
      aiStatus: 'suggestion',
    },
  },
  executiveSummary: {
    status: 'ok',
    data: { total: 8, active: 6, published: 3, inProgress: 2, avgCoveragePct: 82 },
  },
  enabledAnalyses: {
    status: 'ok',
    data: [
      {
        id: 'ana_01J9Y8C3N6',
        title: 'Informe de referenciamiento de pares',
        status: 'published',
        description: 'Seguimiento trimestral de Ecopetrol vs. 14 compañías del sector.',
        updatedAt: '2026-09-22T14:05:00-05:00',
        ownerName: 'Alejandra',
        targetRoute: '/analisis/ana_01J9Y8C3N6/visualizacion',
      },
    ],
  },
  peerNews: {
    status: 'ok',
    data: [
      {
        id: 'nws_01J9Y9A1B2',
        companyId: 'cmp_shell',
        companyName: 'Shell',
        colorKey: 'shell',
        initials: 'SH',
        impact: 'up',
        headline: 'Reporta mejora de margen EBITDA sectorial.',
        source: 'Bloomberg',
      },
    ],
  },
  marketIndicators: {
    status: 'ok',
    data: [
      { id: 'brent', label: 'Brent', value: 71.4, unit: 'usd_b', deltaPct: 0.6, trend: 'up' },
      { id: 'trm', label: 'TRM', value: 4102, unit: 'cop_per_usd', deltaPct: 0.2, trend: 'up' },
    ],
  },
  permissions: { canViewAnalysisList: true },
};

describe('V-03 home response', () => {
  // The strict round-trip and the error / forbidden variants of the five sections are covered by the generic
  // manifest-driven test (registry.contract.test.ts); these are the V-03-specific negative cases.
  it('rejects extra keys inside a section and unknown enum values', () => {
    const extraInSection = {
      ...V03_EXAMPLE,
      executiveSummary: { status: 'ok', data: { ...V03_EXAMPLE.executiveSummary.data, extra: 1 } },
    };
    expect(v03ResponseSchema.safeParse(extraInSection).success).toBe(false);
    const badUnit = {
      ...V03_EXAMPLE,
      marketIndicators: {
        status: 'ok',
        data: [{ ...V03_EXAMPLE.marketIndicators.data[0], unit: 'usd_per_barrel' }],
      },
    };
    expect(v03ResponseSchema.safeParse(badUnit).success).toBe(false);
  });
});
