// HTTP errors (brief L278, L423-424). Only the HTTP layer builds wire errors; their body type is the Zod contract
// `ApiErrorSchema` of src/contracts/common (P3-02), so the OpenAPI spec and the error handler share one shape.
import type { ApiError } from '../../../contracts/common/api-error.js';

/** Wire error body: every non-2xx JSON response of the API (`z.infer<typeof ApiErrorSchema>`). */
export type { ApiError };

/** An error that already knows its HTTP status and stable code; its message is safe to show to the client. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiError['details'];

  constructor(status: number, code: string, message: string, details?: ApiError['details']) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', details?: ApiError['details']) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor() {
    super(429, 'RATE_LIMITED', 'Too many requests, please retry later');
  }
}
