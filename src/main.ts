import { createServer } from 'node:http';
import path from 'node:path';

import { createApp } from './app.js';
import { createContainer } from './composition-root/container.js';
import { EnvValidationError, loadEnv } from './config/env.js';
import { createBootstrapLogger, createLogger } from './config/logger.js';
import { createMockContractRouter } from './presentation/http/routes/mock.routes.js';

import type { Env } from './config/env.js';
import type { AddressInfo } from 'node:net';

// Process entry point: validate env (fail fast), wire the container, build the app and bind the port.
// Concrete dependencies are created only in the composition root (ADR-0001).

function start(env: Env): void {
  const logger = createLogger(env);
  // The deployment package ships the pinned web build in public/ next to dist/ (ADR-0007).
  const container = createContainer(env);
  const routers = env.PROVIDERS_DEFAULT === 'mock' ? [createMockContractRouter(env)] : [];
  const app = createApp(container, { routers, staticDir: path.resolve('public') });
  const server = createServer(app);

  server.on('error', (error) => {
    logger.fatal({ err: error }, 'HTTP server error');
    process.exitCode = 1;
  });

  server.listen(env.PORT, () => {
    const { port } = server.address() as AddressInfo;
    logger.info(
      { port, nodeEnv: env.NODE_ENV, providers: env.PROVIDERS_DEFAULT },
      `listening on port ${String(port)}`,
    );
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    logger.info({ signal }, 'shutting down');
    server.close((error) => {
      if (error) {
        logger.error({ err: error }, 'error while closing the HTTP server');
        process.exitCode = 1;
      }
      logger.info('HTTP server closed');
    });
    server.closeIdleConnections();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

try {
  start(loadEnv(process.env));
} catch (error) {
  if (!(error instanceof EnvValidationError)) throw error;
  createBootstrapLogger().fatal({ variables: error.variables }, error.message);
  process.exitCode = 1;
}
