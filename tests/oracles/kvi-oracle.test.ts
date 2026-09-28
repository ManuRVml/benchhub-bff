/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable security/detect-object-injection */

import { describe, expect, it } from 'vitest';

import kviData from './kvi.json' with { type: 'json' };

describe('KVI oracle', () => {
  const { rows, expected } = kviData;

  it('recomputes category compliance aggregates correctly', () => {
    const weightedRows = rows.filter((r) => r.weightPct !== null);

    function computeCategoryCompliance(
      metric: 'compliancePct' | 'retoPct',
    ): Record<string, number> {
      const byCategory: Record<string, { sumWeighted: number; sumWeights: number }> = {};

      for (const row of weightedRows) {
        const cat = row.category;
        if (!byCategory[cat]) {
          byCategory[cat] = { sumWeighted: 0, sumWeights: 0 };
        }
        const value = row[metric];
        const cappedValue = metric === 'compliancePct' ? Math.min(value, 100) : value;
        byCategory[cat].sumWeighted += cappedValue * row.weightPct;
        byCategory[cat].sumWeights += row.weightPct;
      }

      const result: Record<string, number> = {};
      for (const [cat, data] of Object.entries(byCategory)) {
        if (data.sumWeights > 0) {
          result[cat] = data.sumWeighted / data.sumWeights;
        } else {
          result[cat] = 0;
        }
      }
      return result;
    }

    function getCategoryWeights(): Record<string, number> {
      const byCategory: Record<string, number> = {};
      for (const row of rows) {
        if (row.categoryWeightPct !== null) {
          byCategory[row.category] = row.categoryWeightPct;
        }
      }
      return byCategory;
    }

    function computeGlobal(categoryCompliance: Record<string, number>): number {
      const categoryWeights = getCategoryWeights();
      let globalSum = 0;
      for (const [cat, weight] of Object.entries(categoryWeights)) {
        const catCompliance = categoryCompliance[cat];
        if (catCompliance !== undefined) {
          globalSum += catCompliance * weight;
        }
      }
      return globalSum / 100;
    }

    function computeUncapped(): number {
      let sumWeighted = 0;
      for (const row of weightedRows) {
        sumWeighted += row.compliancePct * row.weightPct;
      }
      return sumWeighted / 100;
    }

    const categoryCompliance = computeCategoryCompliance('compliancePct');
    const categoryReto = computeCategoryCompliance('retoPct');
    const global = computeGlobal(categoryCompliance);
    const reto = computeGlobal(categoryReto);
    const uncapped = computeUncapped();

    const categories = ['Financiero', 'Mercado', 'Estratégico', 'Grupos de Interés'];

    for (const cat of categories) {
      expect(categoryCompliance[cat]).toBeCloseTo(
        expected.categories[cat as keyof typeof expected.categories],
        2,
      );
    }

    expect(global).toBeCloseTo(expected.global, 2);
    expect(reto).toBeCloseTo(expected.reto, 2);
    expect(uncapped).toBeCloseTo(expected.uncapped, 2);
  });
});
