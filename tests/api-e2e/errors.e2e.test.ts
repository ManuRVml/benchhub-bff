import { Router } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/composition-root/container.js';
import { loadEnv } from '../../src/config/env.js';
import { NotFoundError } from '../../src/presentation/http/errors/api-error.js';

const SECRET_DETAIL = 'db password hunter2 at connect';

const testRoutes = Router();
testRoutes.get('/api/v1/__test/boom', () => {
  throw new Error(SECRET_DETAIL);
});
testRoutes.get('/api/v1/__test/async-boom', async () => {
  await Promise.resolve();
  throw new Error(SECRET_DETAIL);
});
testRoutes.get('/api/v1/__test/missing-analysis', () => {
  throw new NotFoundError('Analysis not found', { analysisId: 'ana_missing' });
});

const app = createApp(createContainer(loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent' })), {
  routers: [testRoutes],
});

describe('error handling', () => {
  it('answers an unknown route with 404 and an ApiError body carrying the traceId', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      code: 'NOT_FOUND',
      message: 'Route not found',
      traceId: res.headers['x-trace-id'],
      details: { method: 'GET', path: '/api/v1/does-not-exist' },
    });
    expect((res.body as { traceId: string }).traceId).toMatch(/^[\da-f]{32}$/);
  });

  it.each(['/api/v1/__test/boom', '/api/v1/__test/async-boom'])(
    'turns an error thrown in %s into a generic 500 without stack or message',
    async (path) => {
      const res = await request(app).get(path);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please retry later.',
        traceId: res.headers['x-trace-id'],
      });
      expect(res.text).not.toContain('hunter2');
      expect(res.text).not.toContain('stack');
      expect(res.text).not.toMatch(/\bat \S+:\d+/);
    },
  );

  it('maps an HttpError to its status and stable code', async () => {
    const res = await request(app).get('/api/v1/__test/missing-analysis');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Analysis not found',
      details: { analysisId: 'ana_missing' },
    });
  });

  it('sends a Content-Security-Policy header on a normal response', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('exposes the rate-limit policy headers with the default 300 per minute', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['ratelimit-policy']).toContain('q=300; w=60');
  });
});

describe('rate limit', () => {
  function appWith(env: Record<string, string>): ReturnType<typeof createApp> {
    return createApp(createContainer(loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent', ...env })));
  }

  it('answers the 301st request of a minute with 429 by default', async () => {
    const limited = appWith({});
    for (let index = 1; index <= 300; index += 1) {
      expect((await request(limited).get('/api/v1/health')).status).toBe(200);
    }
    const res = await request(limited).get('/api/v1/health');
    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('honours RATE_LIMIT_PER_MINUTE', async () => {
    const limited = appWith({ RATE_LIMIT_PER_MINUTE: '3' });
    const first = await request(limited).get('/api/v1/health');
    expect(first.headers['ratelimit-policy']).toContain('q=3; w=60');
    await request(limited).get('/api/v1/health');
    expect((await request(limited).get('/api/v1/health')).status).toBe(200);
    expect((await request(limited).get('/api/v1/health')).status).toBe(429);
  });
});
