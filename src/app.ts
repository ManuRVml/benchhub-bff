import { existsSync } from 'node:fs';
import path from 'node:path';

import express from 'express';

import { createLogger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './presentation/http/middlewares/error-handler.js';
import { requestLogger } from './presentation/http/middlewares/request-logger.js';
import {
  cookies,
  rateLimiter,
  responseCompression,
  securityHeaders,
} from './presentation/http/middlewares/security.js';
import { healthRouter } from './presentation/http/routes/health.routes.js';
import { staticRouter } from './presentation/http/static.js';

import type { Container } from './composition-root/container.js';
import type { Express, Router } from 'express';

export interface AppOptions {
  /** Feature routers mounted after the probes and before the 404 / error handlers (route modules from P3 on). */
  readonly routers?: readonly Router[];
  /**
   * Folder with the web build (`public/` in the deployment package, ADR-0007). Mounted after the API routers and before
   * the 404 handler only when it contains an index.html; without a web build (local dev) nothing is served.
   */
  readonly staticDir?: string;
}

/**
 * Builds the Express app without binding a port (brief: "createApp(container) testeable sin puerto"); src/main.ts
 * listens. Order: request logger (traceId first, so every later error has one), security headers, compression, rate
 * limit, cookies, API routes, static SPA (optional), 404, central error handler.
 */
export function createApp(container: Container, options: AppOptions = {}): Express {
  const logger = createLogger(container.env);
  const production = container.env.NODE_ENV === 'production';
  const app = express();
  app.disable('x-powered-by');
  // ADR-0009: behind the Databricks Apps proxy the client IP (rate limit) and HTTPS (Secure cookies) come from the
  // first X-Forwarded-* hop; locally there is no proxy, so the headers are not trusted.
  if (production) app.set('trust proxy', 1);

  app.use(requestLogger(logger));
  app.use(securityHeaders({ production }));
  app.use(responseCompression());
  app.use(rateLimiter(container.env.RATE_LIMIT_PER_MINUTE));
  app.use(cookies());

  app.use(healthRouter());
  for (const router of options.routers ?? []) app.use(router);
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- staticDir is set by the entry point, not by a request
  if (options.staticDir !== undefined && existsSync(path.join(options.staticDir, 'index.html'))) {
    app.use(staticRouter(options.staticDir));
  }

  app.use(notFoundHandler());
  app.use(errorHandler());
  return app;
}
