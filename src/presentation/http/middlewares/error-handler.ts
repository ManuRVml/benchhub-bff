import { HttpError, NotFoundError } from '../errors/api-error.js';

import { getTraceId } from './trace-id.js';

import type { ApiError } from '../errors/api-error.js';
import type { ErrorRequestHandler, RequestHandler } from 'express';

const INTERNAL_MESSAGE = 'An unexpected error occurred. Please retry later.';

/** Catch-all for unmatched routes (registered after every router, before `errorHandler`). */
export function notFoundHandler(): RequestHandler {
  return (req, _res, next) => {
    next(new NotFoundError('Route not found', { method: req.method, path: req.path }));
  };
}

/** Express errors that carry a safe 4xx status (e.g. a malformed body from a parser). */
function isClientError(error: unknown): error is { status: number; expose: true } {
  if (typeof error !== 'object' || error === null) return false;
  const { status, expose } = error as { status?: unknown; expose?: unknown };
  return typeof status === 'number' && status >= 400 && status < 500 && expose === true;
}

/**
 * Central error handler (brief L423-424), last in the chain: every error becomes `ApiError` JSON with the request
 * traceId. Only `HttpError` messages reach the client; anything else is a 500 with a generic message, logged with its
 * stack server-side. Stack traces are never serialized.
 */
export function errorHandler(): ErrorRequestHandler {
  return (error: unknown, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const traceId = getTraceId(req);
    let status: number;
    let body: ApiError;
    if (error instanceof HttpError) {
      status = error.status;
      body = { code: error.code, message: error.message, traceId };
      if (error.details !== undefined) body.details = error.details;
      req.log.warn({ err: error, traceId }, 'request failed');
    } else if (isClientError(error)) {
      status = error.status;
      body = { code: 'BAD_REQUEST', message: 'The request could not be processed', traceId };
      req.log.warn({ err: error, traceId }, 'request rejected');
    } else {
      status = 500;
      body = { code: 'INTERNAL_ERROR', message: INTERNAL_MESSAGE, traceId };
      req.log.error({ err: error, traceId }, 'unhandled error');
    }
    res.status(status).json(body);
  };
}
