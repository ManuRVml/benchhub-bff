/* eslint-disable security/detect-non-literal-fs-filename -- every path is inside a fresh mkdtemp folder of the OS temp dir */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.js';
import { createContainer } from '../../src/composition-root/container.js';
import { loadEnv } from '../../src/config/env.js';

const INDEX_HTML = '<!doctype html><html><body><div id="root"></div></body></html>';
const ASSET_JS = 'console.log("asset");';

const publicDir = mkdtempSync(path.join(tmpdir(), 'bff-public-'));
mkdirSync(path.join(publicDir, 'assets'));
writeFileSync(path.join(publicDir, 'index.html'), INDEX_HTML);
writeFileSync(path.join(publicDir, 'assets', 'x.js'), ASSET_JS);

const env = loadEnv({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });
const app = createApp(createContainer(env), { staticDir: publicDir });

afterAll(() => {
  rmSync(publicDir, { recursive: true, force: true });
});

describe('static SPA serving (ADR-0007)', () => {
  it('falls back to index.html for a deep client route that accepts HTML', async () => {
    const res = await request(app).get('/some/deep/route').set('Accept', 'text/html');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.headers['cache-control']).toBe('no-cache');
    expect(res.text).toBe(INDEX_HTML);
  });

  it('serves a hashed asset file with a long immutable cache', async () => {
    const res = await request(app).get('/assets/x.js');
    expect(res.status).toBe(200);
    expect(res.text).toBe(ASSET_JS);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('keeps unknown /api/* paths as an ApiError 404, never index.html', async () => {
    const res = await request(app).get('/api/v1/unknown').set('Accept', 'text/html');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
    expect(res.text).not.toContain('<div id="root">');
  });

  it('does not answer a POST with index.html', async () => {
    const res = await request(app).post('/some/route').set('Accept', 'text/html');
    expect(res.status).toBe(404);
    expect(res.text).not.toContain('<div id="root">');
  });

  it('does not fall back for requests that do not accept HTML', async () => {
    const res = await request(app).get('/some/route').set('Accept', 'application/json');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('sends a strict same-origin CSP', async () => {
    const res = await request(app).get('/some/deep/route').set('Accept', 'text/html');
    const csp = String(res.headers['content-security-policy']);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
  });

  it('mounts nothing when the folder has no index.html (dev without a web build)', async () => {
    const emptyDir = mkdtempSync(path.join(tmpdir(), 'bff-empty-'));
    try {
      const bare = createApp(createContainer(env), { staticDir: emptyDir });
      const res = await request(bare).get('/some/deep/route').set('Accept', 'text/html');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
    } finally {
      rmSync(emptyDir, { recursive: true, force: true });
    }
  });
});

describe('proxy trust (ADR-0009)', () => {
  it('trusts the first proxy hop only in production', () => {
    const production = loadEnv({
      NODE_ENV: 'production',
      SESSION_SECRET: 's'.repeat(32),
      LOG_LEVEL: 'silent',
    });
    expect(createApp(createContainer(production)).get('trust proxy')).toBe(1);
    expect(createApp(createContainer(env)).get('trust proxy')).toBe(false);
  });
});
