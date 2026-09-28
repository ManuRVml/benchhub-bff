import { describe, expect, it } from 'vitest';

import { EnvValidationError, loadEnv } from '../../../src/config/env.js';

const SECRET = 'x'.repeat(32);

function captureError(source: NodeJS.ProcessEnv): EnvValidationError {
  try {
    loadEnv(source);
  } catch (error) {
    if (error instanceof EnvValidationError) return error;
    throw error;
  }
  throw new Error('expected loadEnv to throw EnvValidationError');
}

describe('loadEnv', () => {
  it('applies the documented defaults to an empty environment', () => {
    expect(loadEnv({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3001,
      LOG_LEVEL: 'info',
      PROVIDERS_DEFAULT: 'mock',
      MOCK_SCENARIO: 'default',
      MOCK_ROLE: 'analyst_creator',
      MOCK_LATENCY_MS: 0,
      MOCK_LOGIN_USERNAME: 'ecopetrol@ecopetrol.com',
      MOCK_LOGIN_PASSWORD: 'ecopetrol',
      RATE_LIMIT_PER_MINUTE: 300,
      SESSION_STORE: 'memory',
      OTEL_ENABLED: false,
    });
  });

  it('returns a frozen object', () => {
    expect(Object.isFrozen(loadEnv({}))).toBe(true);
  });

  it('parses explicit values', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'debug',
      PROVIDERS_DEFAULT: 'real',
      MOCK_SCENARIO: 'slow',
      MOCK_ROLE: 'executive_viewer',
      MOCK_LATENCY_MS: '250',
      RATE_LIMIT_PER_MINUTE: '3000',
      SESSION_SECRET: SECRET,
      OTEL_ENABLED: 'true',
    });
    expect(env).toMatchObject({
      NODE_ENV: 'production',
      PORT: 8080,
      LOG_LEVEL: 'debug',
      PROVIDERS_DEFAULT: 'real',
      MOCK_SCENARIO: 'slow',
      MOCK_ROLE: 'executive_viewer',
      MOCK_LATENCY_MS: 250,
      RATE_LIMIT_PER_MINUTE: 3000,
      SESSION_SECRET: SECRET,
      OTEL_ENABLED: true,
    });
  });

  it('gives DATABRICKS_APP_PORT precedence over PORT (ADR-0007)', () => {
    expect(loadEnv({ PORT: '3001', DATABRICKS_APP_PORT: '8000' }).PORT).toBe(8000);
    expect(loadEnv({ DATABRICKS_APP_PORT: '8000' }).PORT).toBe(8000);
    expect(loadEnv({ PORT: '4000' }).PORT).toBe(4000);
  });

  it('rejects a value outside an enum and names the variable', () => {
    const error = captureError({ PROVIDERS_DEFAULT: 'fake' });
    expect(error.variables).toEqual(['PROVIDERS_DEFAULT']);
    expect(error.message).toContain('PROVIDERS_DEFAULT');
  });

  it('requires SESSION_SECRET in production and names it', () => {
    const error = captureError({ NODE_ENV: 'production' });
    expect(error.variables).toEqual(['SESSION_SECRET']);
    expect(error.message).toContain('SESSION_SECRET');
    expect(() => loadEnv({ NODE_ENV: 'production', SESSION_SECRET: SECRET })).not.toThrow();
  });

  it('treats an empty SESSION_SECRET as missing and rejects a short one', () => {
    expect(captureError({ NODE_ENV: 'production', SESSION_SECRET: '' }).variables).toEqual([
      'SESSION_SECRET',
    ]);
    expect(captureError({ SESSION_SECRET: 'short' }).variables).toEqual(['SESSION_SECRET']);
  });

  it('reports every invalid variable together', () => {
    const error = captureError({
      NODE_ENV: 'staging',
      PORT: '70000',
      LOG_LEVEL: 'loud',
      MOCK_LATENCY_MS: '-5',
      OTEL_ENABLED: 'maybe',
    });
    expect(error.variables).toEqual(
      expect.arrayContaining(['NODE_ENV', 'PORT', 'LOG_LEVEL', 'MOCK_LATENCY_MS', 'OTEL_ENABLED']),
    );
    expect(error.variables).toHaveLength(5);
    for (const name of error.variables) expect(error.message).toContain(name);
  });

  it.each(['0', '-1', '2.5', 'many'])('rejects RATE_LIMIT_PER_MINUTE=%s', (value) => {
    expect(captureError({ RATE_LIMIT_PER_MINUTE: value }).variables).toEqual([
      'RATE_LIMIT_PER_MINUTE',
    ]);
  });

  it('trims MOCK_LOGIN_USERNAME and keeps MOCK_LOGIN_PASSWORD as given', () => {
    const env = loadEnv({ MOCK_LOGIN_USERNAME: ' Demo@Example.com ', MOCK_LOGIN_PASSWORD: ' s3 ' });
    expect(env.MOCK_LOGIN_USERNAME).toBe('Demo@Example.com');
    expect(env.MOCK_LOGIN_PASSWORD).toBe(' s3 ');
  });

  it('rejects a MOCK_LOGIN_USERNAME that is not an e-mail and a too long MOCK_LOGIN_PASSWORD', () => {
    expect(captureError({ MOCK_LOGIN_USERNAME: 'analyst_creator' }).variables).toEqual([
      'MOCK_LOGIN_USERNAME',
    ]);
    expect(captureError({ MOCK_LOGIN_PASSWORD: 'x'.repeat(129) }).variables).toEqual([
      'MOCK_LOGIN_PASSWORD',
    ]);
  });

  it('rejects SESSION_STORE=lakebase until Phase 4 with a clear message', () => {
    const error = captureError({ SESSION_STORE: 'lakebase' });
    expect(error.variables).toEqual(['SESSION_STORE']);
    expect(error.message).toMatch(/lakebase is not available until Phase 4/);
  });
});
