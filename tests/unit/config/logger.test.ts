import { Writable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { createLogger } from '../../../src/config/logger.js';

function capture(): { stream: Writable; lines: () => string } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  return { stream, lines: () => chunks.join('') };
}

describe('createLogger', () => {
  it('redacts cookies, authorization, set-cookie and token fields (ADR-0006 §4)', () => {
    const { stream, lines } = capture();
    const logger = createLogger({ LOG_LEVEL: 'info' }, stream);
    logger.info(
      {
        req: {
          headers: {
            cookie: 'sid=cookie-secret',
            authorization: 'Bearer auth-secret',
            'x-csrf-token': 'csrf-secret',
          },
        },
        res: { headers: { 'set-cookie': 'sid=set-cookie-secret' } },
        session: { accessToken: 'access-secret', refreshToken: 'refresh-secret' },
      },
      'request completed',
    );
    const output = lines();
    for (const secret of [
      'cookie-secret',
      'auth-secret',
      'csrf-secret',
      'set-cookie-secret',
      'access-secret',
      'refresh-secret',
    ]) {
      expect(output).not.toContain(secret);
    }
    expect(output).toContain('[REDACTED]');
    expect(output).toContain('request completed');
  });

  it('redacts the A-05 password in a logged request body', () => {
    const { stream, lines } = capture();
    const logger = createLogger({ LOG_LEVEL: 'info' }, stream);
    logger.info(
      { req: { body: { username: 'ecopetrol@ecopetrol.com', password: 'pw-body-secret' } } },
      'request completed',
    );
    logger.info({ body: { password: 'pw-top-secret' } }, 'body logged');
    const output = lines();
    expect(output).not.toContain('pw-body-secret');
    expect(output).not.toContain('pw-top-secret');
    expect(output).toContain('[REDACTED]');
  });

  it('honours LOG_LEVEL', () => {
    const { stream, lines } = capture();
    const logger = createLogger({ LOG_LEVEL: 'warn' }, stream);
    logger.info('hidden');
    logger.warn('shown');
    expect(lines()).not.toContain('hidden');
    expect(lines()).toContain('shown');
  });
});
