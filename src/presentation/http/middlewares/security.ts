import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

import { TooManyRequestsError } from '../errors/api-error.js';

import type { RequestHandler } from 'express';

export interface SecurityOptions {
  /** true in production: browsers are told to upgrade insecure requests (the Databricks Apps proxy serves HTTPS). */
  readonly production: boolean;
}

/**
 * helmet with a CSP for the same-origin SPA of ADR-0007 / ADR-0009: everything from 'self', no inline scripts, API
 * calls only to 'self', self-hosted fonts, images from 'self' or data: URIs (chart exports), no framing by other origins.
 */
export function securityHeaders({ production }: SecurityOptions): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: production ? [] : null,
      },
    },
  });
}

export function responseCompression(): RequestHandler {
  return compression();
}

export function cookies(): RequestHandler {
  return cookieParser();
}

/** A 60 s window; limit is the default per client IP, overridden by the RATE_LIMIT_PER_MINUTE env var. */
export const RATE_LIMIT = { windowMs: 60_000, limit: 300 } as const;

export function rateLimiter(limitPerMinute: number = RATE_LIMIT.limit): RequestHandler {
  return rateLimit({
    windowMs: RATE_LIMIT.windowMs,
    limit: limitPerMinute,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError());
    },
  });
}
