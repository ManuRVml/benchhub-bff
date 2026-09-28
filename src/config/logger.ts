import { pino } from 'pino';

import type { Env } from './env.js';
import type { DestinationStream, Level, Logger, LoggerOptions } from 'pino';

// ADR-0006 §4: secrets and session material never reach the logs.
export const REDACTED_PATHS: readonly string[] = [
  'req.headers.cookie',
  'req.headers.authorization',
  'req.headers["x-csrf-token"]',
  'res.headers["set-cookie"]',
  'headers.cookie',
  'headers.authorization',
  'headers["set-cookie"]',
  '*.accessToken',
  '*.refreshToken',
  '*.idToken',
  '*.clientSecret',
  '*.password',
  // A-05 password login: `*.password` matches one level only, so the request body path is named explicitly.
  'req.body.password',
  'body.password',
  '*.token',
  '*.code_verifier',
  '*.code',
];

function options(level: Level | 'silent'): LoggerOptions {
  return {
    level,
    base: { service: 'eco-comparator-bff' },
    redact: { paths: [...REDACTED_PATHS], censor: '[REDACTED]' },
  };
}

/**
 * Root logger for the process: JSON to stdout, level from LOG_LEVEL (ADR-0006 §1).
 * `destination` exists for tests; production code always logs to stdout.
 */
export function createLogger(env: Pick<Env, 'LOG_LEVEL'>, destination?: DestinationStream): Logger {
  return destination ? pino(options(env.LOG_LEVEL), destination) : pino(options(env.LOG_LEVEL));
}

/** Logger used before the environment is valid (it cannot trust LOG_LEVEL). */
export function createBootstrapLogger(): Logger {
  return pino(options('info'));
}
