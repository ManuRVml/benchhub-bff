import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/composition-root/container.js';
import { loadEnv } from '../../src/config/env.js';

const app = createApp(createContainer(loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent' })));

describe('health probes', () => {
  it('GET /api/v1/health answers 200 (liveness)', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', version: '0.1.0' });
  });

  it('GET /api/v1/ready answers 200 (readiness, no dependencies yet)', async () => {
    const res = await request(app).get('/api/v1/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'degraded',
      version: '0.1.0',
      checks: [
        { name: 'session-store', status: 'ok' },
        { name: 'analytics-provider', status: 'ok' },
        { name: 'job-orchestrator', status: 'failing' },
      ],
    });
  });

  it('echoes a 32-hex traceId in x-trace-id', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-trace-id']).toMatch(/^[\da-f]{32}$/);
  });

  it('reuses the trace id of a valid incoming traceparent (ADR-0006 §3)', async () => {
    const traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    const res = await request(app)
      .get('/api/v1/health')
      .set('traceparent', `00-${traceId}-00f067aa0ba902b7-01`);
    expect(res.headers['x-trace-id']).toBe(traceId);
  });
});
