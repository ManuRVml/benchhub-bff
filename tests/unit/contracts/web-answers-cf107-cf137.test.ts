import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { v04QuerySchema } from '../../../src/contracts/analyses/v-04-analyses.js';
import { c10RequestSchema } from '../../../src/contracts/commands/c-10-create-review-comment.js';
import { c25ResponseSchema } from '../../../src/contracts/commands/c-25-generate-strategic-plan.js';
import { c28RequestSchema } from '../../../src/contracts/commands/c-28-update-presentation-builder.js';
import { c33ResponseSchema } from '../../../src/contracts/commands/c-33-send-assistant-message.js';
import { c37RequestSchema } from '../../../src/contracts/commands/c-37-update-user-settings.js';
import { UnitCodeSchema } from '../../../src/contracts/common/units.js';
import { o01ResponseSchema } from '../../../src/contracts/operations/o-01-operation-status.js';
import { o04ResponseSchema } from '../../../src/contracts/operations/o-04-health-ready.js';
import { CONTRACT_SCHEMAS } from '../../../src/contracts/registry.js';
import { v36ResponseSchema } from '../../../src/contracts/value-monitor/v-36-value-monitor-benchmark-radar.js';
import { v23ResponseSchema } from '../../../src/contracts/visualization/v-23-weight-recommendations.js';

// Web answers CF-107..CF-137 (re-sync from web@12dbc78, P3-CN34b): the rules the contract examples do not exercise.
// Round-trips of the examples themselves are covered by registry.contract.test.ts.
const example = (file: string): Record<string, unknown> =>
  JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- file names are the literals of this file
    readFileSync(new URL(`../../contract-examples/${file}`, import.meta.url), 'utf8'),
  ) as Record<string, unknown>;

describe('web answers CF-107..CF-137', () => {
  it('CF-120: V-04 pageSize defaults to 20 and caps at 100', () => {
    expect(v04QuerySchema.parse({}).pageSize).toBe(20);
    expect(v04QuerySchema.parse({ pageSize: '100' }).pageSize).toBe(100);
    expect(v04QuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
  });

  it('CF-108: C-25 plan status is suggestion or committed and weights are 0..100', () => {
    const base = example('C-25.response.json');
    const plan = base.plan as Record<string, unknown>;
    const [row] = plan.rows as Record<string, unknown>[];
    const withPlan = (patch: Record<string, unknown>) => ({ ...base, plan: { ...plan, ...patch } });
    expect(c25ResponseSchema.safeParse(withPlan({ status: 'committed' })).success).toBe(true);
    expect(c25ResponseSchema.safeParse(withPlan({ status: 'draft' })).success).toBe(false);
    expect(
      c25ResponseSchema.safeParse(withPlan({ rows: [{ ...row, weightPct: 200 }] })).success,
    ).toBe(false);
  });

  it('CF-109: C-28 accepts any subset of the builder state and nothing outside it', () => {
    expect(c28RequestSchema.safeParse({}).success).toBe(true);
    expect(c28RequestSchema.safeParse({ includeCover: false }).success).toBe(true);
    expect(c28RequestSchema.safeParse({ slideCount: 7 }).success).toBe(false);
  });

  it('CF-111: C-33 events carry only the field of their type', () => {
    expect(c33ResponseSchema.safeParse({ type: 'done', messageId: 'msg_1' }).success).toBe(true);
    expect(c33ResponseSchema.safeParse({ type: 'done', content: '…' }).success).toBe(false);
    expect(c33ResponseSchema.safeParse({ type: 'error', content: '…' }).success).toBe(false);
    expect(c33ResponseSchema.safeParse({ type: 'token', messageId: 'msg_1' }).success).toBe(false);
  });

  it('CF-115: C-37 font scale is 0.9, 1 or 1.1', () => {
    expect(c37RequestSchema.safeParse({ fontScale: 1.1 }).success).toBe(true);
    expect(c37RequestSchema.safeParse({ fontScale: 1.2 }).success).toBe(false);
    expect(c37RequestSchema.safeParse({ fontSize: 'large' }).success).toBe(false);
  });

  it('CF-116 / CF-119: comparison profiles live under the analysis; /health and /ready are separate', () => {
    expect(CONTRACT_SCHEMAS['C-38']?.endpoint.path).toBe(
      '/api/v1/analyses/:analysisId/comparison-profiles',
    );
    expect(CONTRACT_SCHEMAS['C-40']?.endpoint.path).toBe(
      '/api/v1/analyses/:analysisId/comparison-profiles/:profileId',
    );
    expect(CONTRACT_SCHEMAS['O-04']?.endpoint.path).toBe('/api/v1/health');
    expect(CONTRACT_SCHEMAS['O-05']?.endpoint.path).toBe('/api/v1/ready');
    expect(o04ResponseSchema.safeParse({ status: 'degraded', version: '0.1.0' }).success).toBe(
      false,
    );
  });

  it('CF-117: O-01 kind is one of the four job kinds', () => {
    const base = example('O-01.response.json');
    expect(o01ResponseSchema.safeParse({ ...base, kind: 'export' }).success).toBe(true);
    expect(o01ResponseSchema.safeParse({ ...base, kind: 'analysis-generation' }).success).toBe(
      false,
    );
  });

  it('CF-127: the unit codes include musd and cop_per_kwh but not times', () => {
    expect(UnitCodeSchema.safeParse('musd').success).toBe(true);
    expect(UnitCodeSchema.safeParse('cop_per_kwh').success).toBe(true);
    expect(UnitCodeSchema.safeParse('times').success).toBe(false);
  });

  it('CF-130: V-23 horizon has exactly the three cards, each with its own key', () => {
    const base = example('V-23.fragment.1.json');
    const items = base.items as Record<string, unknown>[];
    expect(v23ResponseSchema.safeParse({ ...base, items: items.slice(0, 2) }).success).toBe(false);
    const [first, ...rest] = items;
    const text = first?.text as Record<string, unknown>;
    const wrongKey = { ...first, text: { ...text, key: 'reco.horizon.dataConsistency' } };
    expect(v23ResponseSchema.safeParse({ ...base, items: [wrongKey, ...rest] }).success).toBe(
      false,
    );
  });

  it('CF-132: review threads share one entity type enum', () => {
    const base = { entityId: 'vm_1', text: 'Revisar la meta', entityType: 'value_monitor' };
    expect(c10RequestSchema.safeParse(base).success).toBe(true);
    expect(c10RequestSchema.safeParse({ ...base, entityType: 'slide' }).success).toBe(false);
  });

  it('CF-136 / CF-137: V-36 insight fails alone; colorKey is a bare slug', () => {
    const base = example('V-36.response.json');
    const failedInsight = {
      ...base,
      insight: { status: 'error', errorCode: 'LLM_UNAVAILABLE' },
    };
    expect(v36ResponseSchema.safeParse(failedInsight).success).toBe(true);
    const radar = base.radar as { data: { series: Record<string, unknown>[] } };
    const [series] = radar.data.series;
    const withColorKey = (colorKey: string) => ({
      ...base,
      radar: { ...radar, data: { ...radar.data, series: [{ ...series, colorKey }] } },
    });
    expect(v36ResponseSchema.safeParse(withColorKey('ecopetrol')).success).toBe(true);
    expect(v36ResponseSchema.safeParse(withColorKey('chart.ecopetrol')).success).toBe(false);
  });
});
