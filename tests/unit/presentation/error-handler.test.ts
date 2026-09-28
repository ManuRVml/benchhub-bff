import { describe, expect, it, vi } from 'vitest';

import { HttpError } from '../../../src/presentation/http/errors/api-error.js';
import {
  errorHandler,
  notFoundHandler,
} from '../../../src/presentation/http/middlewares/error-handler.js';

import type { ErrorRequestHandler, Request, Response } from 'express';

function createMockReq(overrides?: Partial<Request>): Request {
  return {
    log: { warn: vi.fn(), error: vi.fn() },
    headers: { traceparent: '00-1234567890abcdef1234567890abcdef-0000000000000001-01' },
    method: 'GET',
    path: '/api/v1/test',
    id: '1234567890abcdef1234567890abcdef',
    ...overrides,
  } as Request;
}

function createMockRes(overrides?: Partial<Response>) {
  const status = vi.fn();
  const json = vi.fn();
  const send = vi.fn();
  const res = {
    headersSent: false,
    setHeader: vi.fn(),
    getHeader: vi.fn(),
    status,
    json,
    send,
    ...overrides,
  } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  send.mockReturnValue(res);
  return { json, res, send, status };
}

function createMockNext(): Parameters<ErrorRequestHandler>[3] {
  return vi.fn();
}

describe('errorHandler', () => {
  it('returns an HttpError status, code, message and traceId', () => {
    const { json, res, status } = createMockRes();
    const next = createMockNext();
    const req = createMockReq();

    const handler = errorHandler();
    const error = new HttpError(422, 'VALIDATION_ERROR', 'The request is invalid');

    handler(error, req, res, next);

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith({
      code: 'VALIDATION_ERROR',
      message: 'The request is invalid',
      traceId: '1234567890abcdef1234567890abcdef',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('handles a client error with status 4xx and expose true', () => {
    const { json, res, status } = createMockRes();
    const next = createMockNext();
    const req = createMockReq();

    const handler = errorHandler();
    const error = { status: 400, expose: true } as unknown as Error;

    handler(error, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      code: 'BAD_REQUEST',
      message: 'The request could not be processed',
      traceId: '1234567890abcdef1234567890abcdef',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('delegates an error without writing a body after headers are sent', () => {
    const { json, res, status } = createMockRes({ headersSent: true });
    const next = createMockNext();
    const req = createMockReq();
    const error = new Error('stream failed');

    errorHandler()(error, req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});

describe('notFoundHandler', () => {
  it('creates a NotFoundError with method and path in details', () => {
    const { res } = createMockRes();
    const next = createMockNext();
    const req = createMockReq({ method: 'POST', path: '/api/v1/unknown' });

    const handler = notFoundHandler();
    handler(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        code: 'NOT_FOUND',
        details: { method: 'POST', path: '/api/v1/unknown' },
      }),
    );
  });
});
