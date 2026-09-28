import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

import { v09ResponseSchema } from '../../../src/contracts/results/v-09-results-header.js';

const require = createRequire(import.meta.url);
const fixture =
  require('../../../src/presentation/http/routes/mock-examples/V-09.response.json') as unknown;

describe('V-09 Results manifest', () => {
  it('contains only Results modules; the TBG and ILP visual modules are not rendered on SCR-08', () => {
    const response = v09ResponseSchema.parse(fixture);
    const moduleIds = response.modules.map((module) => module.id);

    for (const visualizationModule of [
      'tbgIndicatorComparator',
      'futureAspiration',
      'tbgHorizon',
      'tbgDimensionWeights',
      'comparisonProfiles',
    ]) {
      expect(moduleIds).not.toContain(visualizationModule);
    }
  });
});
