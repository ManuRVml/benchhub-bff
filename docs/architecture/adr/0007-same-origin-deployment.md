# ADR-0007: Same-origin deployment — one Databricks App serving the pinned web build and `/api`

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L104–120 (§2.3 local development with two repos: BFF on 3001 in mock mode, Vite
  proxy `/api → http://localhost:3001`, always relative `/api/...`, same origin, no CORS; BFF mock image; §2.4 deployment:
  web `dist/` as a versioned artifact, BFF pipeline downloads the indicated version into `public/`, packages and deploys to
  Databricks Apps with `app.yaml` and `DATABRICKS_APP_PORT`, static files with SPA fallback; alternative of two Apps needs
  strict CORS and adequate `SameSite`), L266–267 (`public/` only in the deployment package; `app.yaml`), L428 (serve
  `public/` with SPA fallback), L22 (no cross-repo paths).

## Context

The brief recommends same origin by default, to be confirmed by ADR (L113). The web and the BFF are separate repositories
(L22), but the product is deployed as one Databricks App. Cookie-based sessions (ADR-0004) and SSE (ADR-0005) are much
simpler without cross-origin concerns.

## Decision

1. **One Databricks App** runs the BFF (Node, Express 5). It exposes `/api/*` and serves the web build from `public/`.
2. **Static serving:** `express.static(public/)` for hashed assets with `Cache-Control: public, max-age=31536000, immutable`;
   `index.html` with `Cache-Control: no-cache`; **SPA fallback**: any `GET` that is not `/api/*`, accepts `text/html` and does
   not match a file returns `index.html`. Unknown `/api/*` paths return `404 ApiError`, never `index.html`.
   `helmet` CSP is set to what the web build needs (`default-src 'self'`, self-hosted fonts, no inline scripts) (L427).
3. **Pinned web version:** the deploy pipeline reads `deploy/web-artifact.lock.json` `{ "version": "x.y.z", "sha256": "<hex>" }`,
   downloads that `dist` artifact from the web pipeline's releases, verifies the hash and extracts it into `public/` of the
   deployment package. `public/` is git-ignored in the BFF repo; nothing references the sibling repo's folder (L22).
4. **Relative API calls:** the web always calls relative `/api/...` with `credentials: 'include'`; there is no API base URL
   env var in production.
5. **Databricks Apps packaging:** `app.yaml` at repo root runs `node dist/main.js`; the server listens on
   `process.env.DATABRICKS_APP_PORT` (validated in `config/env.ts`; local default `3001`); `NODE_ENV=production`;
   secrets come from App resources / Secret Scopes (ADR-0004), not from `app.yaml` literals. `trust proxy` is set so `Secure`
   cookies and client IPs work behind the Databricks proxy.
6. **Local development:** BFF `pnpm dev` on `http://localhost:3001` with `PROVIDERS_DEFAULT=mock`; web `pnpm dev` with the Vite
   proxy `/api → http://localhost:3001` (same effective origin, no CORS) (L106–107). The web can also run with
   `VITE_API_MODE=mock` without the BFF (L108). CI E2E of the web runs against the BFF mock container image (L109;
   engine per ADR-0008).

## Alternatives considered

- **Two Apps (web static + BFF API)** (L118). Requires strict CORS allowlist, `SameSite=None; Secure` cookies (third-party
  cookie restrictions), CSRF across origins and SSE with credentials across origins. More moving parts, no benefit for a
  single-client BFF (L299). Rejected.
- **CDN/static hosting for the web + App for the API.** Same cross-origin costs, and no CDN is part of the given architecture
  (L62–74). Rejected.
- **Build the web inside the BFF pipeline from source.** Couples the BFF build to the web repo's toolchain and source,
  violating L22. Rejected; the BFF consumes only a versioned artifact.

## Consequences

- Positive: no CORS, first-party `SameSite=Lax` cookies, simple SSE, one deployment unit and one URL.
- Positive: web and BFF still release independently; the deployed pair is explicit in `web-artifact.lock.json`.
- Negative: a web-only change needs a BFF deployment (new lock entry) to reach production.
- Negative: the BFF must keep its CSP in sync with the web build's needs (tracked when the web adds a new asset origin).
- Follow-ups: `app.yaml`, static/SPA middleware and CSP in P4; deploy pipeline in ADR-0008.
