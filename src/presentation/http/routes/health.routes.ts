import { Router } from 'express';

/** Liveness and readiness probes (brief L418). */
export function healthRouter(): Router {
  const router = Router();

  // Liveness: 200 as long as the process can serve requests.
  router.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'ok', version: '0.1.0' });
  });

  // Readiness: no external dependencies exist yet.
  // TODO(P4): check the real providers (Databricks SQL, session store) and answer 503 while any is unavailable.
  router.get('/api/v1/ready', (_req, res) => {
    res.status(200).json({
      status: 'degraded',
      version: '0.1.0',
      checks: [
        { name: 'session-store', status: 'ok' },
        { name: 'analytics-provider', status: 'ok' },
        { name: 'job-orchestrator', status: 'failing' },
      ],
    });
  });

  return router;
}
