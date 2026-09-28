# ADR-0009: Content-Security-Policy for the same-origin SPA and proxy trust behind Databricks Apps

## Status

Accepted.

## Context

ADR-0007 deploys one Databricks App: the BFF serves `/api/*` and the pinned web build from `public/`, so the SPA and
the API share one origin. P2-B03 shipped helmet's default CSP, which still allows `style-src https: 'unsafe-inline'` and
`font-src https: data:` and does not state `connect-src`. The brief asks for a CSP that fits what the web build needs
(`default-src 'self'`, self-hosted fonts, no inline scripts — `prompt_Start_Eco.md` L427) and for secure cookies behind
the platform proxy (L111–117). Databricks Apps terminates TLS and forwards requests through one reverse proxy; without
`trust proxy`, Express sees the proxy's address as the client IP (the rate limiter would throttle every user as one
client) and `req.secure` stays false (Secure cookies of ADR-0004 would not be set).

## Decision

1. **CSP** (helmet, `useDefaults: false`, set in `src/presentation/http/middlewares/security.ts`):
   `default-src 'self'`; `script-src 'self'`; `script-src-attr 'none'`; `style-src 'self'`; `connect-src 'self'`;
   `font-src 'self'`; `img-src 'self' data:`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`;
   `frame-ancestors 'self'`; `upgrade-insecure-requests` only when `NODE_ENV=production`.
   No `'unsafe-inline'` and no `'unsafe-eval'`. `data:` images cover chart exports; fonts are self-hosted by the web build.
2. **Proxy trust:** `app.set('trust proxy', 1)` when `NODE_ENV=production` — exactly one hop (the Databricks Apps proxy),
   never `true`, so a client cannot spoof its IP with extra `X-Forwarded-For` entries. Outside production no proxy
   headers are trusted.
3. Both settings live in `createApp` (`src/app.ts`) and are covered by `tests/api-e2e/static.e2e.test.ts` and
   `tests/api-e2e/errors.e2e.test.ts`.

## Alternatives considered

- **Keep helmet's default CSP.** Allows inline styles and any HTTPS style / font origin the SPA never uses. Rejected.
- **Nonce- or hash-based CSP.** Needed only for inline scripts; the Vite build emits external files. Deferred until an
  inline script is unavoidable.
- **`report-uri` / `report-to`.** No collector exists (ADR-0006 defers telemetry). Deferred; add together with OTel.
- **`trust proxy` true or a CIDR list.** `true` trusts every hop (IP spoofing); the proxy address range is not published.
  One hop matches the platform. Rejected.
- **Trust the proxy in every environment.** Local runs have no proxy; trusting headers there lets any request fake its IP.
  Rejected.

## Consequences

- The web build must not rely on inline `<script>`, inline event handlers or third-party origins (fonts, CDNs, analytics);
  React inline `style` props set through the DOM API keep working, but inline `style` attributes in `index.html` do not.
  The web lane checks the built SPA against this header before the first deploy.
- If Databricks Apps adds another proxy hop, `trust proxy` must change to the new hop count (rate limit keys and Secure
  cookies depend on it).
- Adding an external origin (e.g. an SSO iframe or telemetry endpoint) needs a new ADR amending this CSP.
