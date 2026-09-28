import { describe, expect, it } from 'vitest';

import { fixtureMarker } from '../../tools/arch-fixtures/fixture-marker.js';

describe('tooling smoke', () => {
  it('resolves the arch-fixtures marker through the test runner', () => {
    expect(fixtureMarker).toBe('P2-B01a-arch-fixtures-marker');
  });
});
