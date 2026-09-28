import { randomBytes } from 'node:crypto';

import type { IncomingMessage } from 'node:http';

// ADR-0006 §3: one W3C-compatible 32-hex traceId per request; a valid incoming `traceparent` is reused.
const TRACEPARENT = /^[\da-f]{2}-([\da-f]{32})-[\da-f]{16}-[\da-f]{2}$/;
const ZERO_TRACE_ID = '0'.repeat(32);

export const TRACE_ID_HEADER = 'x-trace-id';

export function traceIdFrom(req: IncomingMessage): string {
  const header = req.headers.traceparent;
  const match = typeof header === 'string' ? TRACEPARENT.exec(header.trim().toLowerCase()) : null;
  const incoming = match?.[1];
  return incoming !== undefined && incoming !== ZERO_TRACE_ID
    ? incoming
    : randomBytes(16).toString('hex');
}

/** The traceId assigned by the request logger (pino-http stores it as `req.id`). */
export function getTraceId(req: IncomingMessage): string {
  const { id } = req;
  if (typeof id === 'string') return id;
  if (typeof id === 'number') return String(id);
  return 'unknown';
}
