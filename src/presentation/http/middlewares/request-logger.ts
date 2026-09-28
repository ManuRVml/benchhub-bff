import { pinoHttp } from 'pino-http';

import { TRACE_ID_HEADER, traceIdFrom } from './trace-id.js';

import type { RequestHandler } from 'express';
import type { Logger } from 'pino';

const PROBE_PATHS = new Set(['/api/v1/health', '/api/v1/ready']);

/**
 * pino-http with one traceId per request (ADR-0006 §2-3): the id is `req.id`, echoed as `x-trace-id` and logged as
 * `traceId`. Probes log at debug, 4xx at warn, 5xx at error.
 */
export function requestLogger(logger: Logger): RequestHandler {
  return pinoHttp({
    logger,
    genReqId: (req, res) => {
      const traceId = traceIdFrom(req);
      res.setHeader(TRACE_ID_HEADER, traceId);
      return traceId;
    },
    customAttributeKeys: { reqId: 'traceId' },
    customLogLevel: (req, res, error) => {
      if (error !== undefined || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      const path = req.url.replace(/\?.*$/, '');
      return PROBE_PATHS.has(path) ? 'debug' : 'info';
    },
  });
}
