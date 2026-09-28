import path from 'node:path';

import { Router, static as serveStatic } from 'express';

import type { Response } from 'express';

// Static SPA serving (ADR-0007 §2): hashed assets are immutable, index.html is always revalidated, and any GET outside
// /api/ that accepts HTML falls back to index.html so client-side routes survive a reload.

const IMMUTABLE = 'public, max-age=31536000, immutable';
const NO_CACHE = 'no-cache';
/** Vite emits content-hashed files such as `assets/index-4f3a9c1b.js`. */
const HASHED_ASSET = /(^|[\\/])assets[\\/]|[.-][\da-f]{8,}\.[a-z\d]+$/i;

function setCacheHeaders(res: Response, filePath: string): void {
  res.setHeader('Cache-Control', HASHED_ASSET.test(filePath) ? IMMUTABLE : NO_CACHE);
}

export function staticRouter(publicDir: string): Router {
  const root = path.resolve(publicDir);
  const router = Router();

  router.use(serveStatic(root, { index: false, setHeaders: setCacheHeaders }));

  router.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/api' || !req.accepts('html')) {
      next();
      return;
    }
    res.setHeader('Cache-Control', NO_CACHE);
    res.sendFile('index.html', { root }, (error) => {
      if (error) next(error);
    });
  });

  return router;
}
