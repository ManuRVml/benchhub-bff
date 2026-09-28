# ADR-0004: Session management — token-handler pattern with a pluggable session store

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L62–76 (end-to-end context: Lakebase as the transactional authority L65, Entra ID
  + Graph L71, Key Vault / Secret Scopes L72), L86–88 (the web never sees downstream tokens), L294 (token-handler pattern,
  OIDC code + PKCE finished by the BFF, `HttpOnly` `Secure` `SameSite` cookie, CSRF for unsafe methods), L395–398 (auth
  endpoints), L389 (mock identity only in development/test). Plan: `.plan/PLAN.md` L44 (decision D6).

## Context

The BFF completes the Entra ID login (OIDC authorization code + PKCE); the browser only receives a session cookie with
`HttpOnly`, `Secure`, `SameSite=Lax/Strict`; Entra tokens, the Databricks Service Principal token and external API tokens
never reach the browser; unsafe methods are CSRF-protected (L294). The endpoints are `GET /api/v1/auth/login`,
`GET /api/v1/auth/callback`, `POST /api/v1/auth/logout` and `GET /api/v1/session` (L395–398). There is no Entra tenant/app
registration yet (synthesis OQ-17), so a mock IdP comes first. Deployment is one Databricks App, same origin (ADR-0007), and
Lakebase is the only transactional store (L65). The login screen drops the password field (plan D6, CF-29): the username is
passed as `login_hint` only.

## Decision

1. **Flow.** `GET /auth/login?returnTo=&loginHint=` creates a short-lived login transaction (`state`, `nonce`, PKCE
   `code_verifier`, `returnTo` validated as a relative path) stored server-side, and redirects to the IdP authorize endpoint
   with `code_challenge` (S256) and `login_hint`. `GET /auth/callback` validates `state`, exchanges the code with the
   verifier, validates the ID token (issuer, audience, nonce, expiry), maps Entra groups to roles (via `DirectoryProvider`),
   creates the session and redirects. `POST /auth/logout` destroys the session and clears the cookie.
2. **IdP behind a port.** `IdentityProvider` has a mock adapter (in-process authorize/token endpoints, predefined users and
   roles; identity selectable by header **only** in `NODE_ENV=development|test`, L389) and a `microsoft` adapter (openid-client
   against Entra) that stays a `NotImplementedError` stub until the tenant exists.
3. **Cookie.** Opaque random session id (≥ 256 bits, `crypto.randomBytes`), name `__Host-eco_sid`, attributes `HttpOnly;
   Secure; SameSite=Lax; Path=/`, no `Domain`. `Lax` (not `Strict`) so the top-level redirect back from Entra carries the
   cookie; the login transaction uses its own short-lived `__Host-eco_login` cookie. Session id is rotated at login.
4. **Store port.** `SessionStore { get, set, touch, destroy }` holds `{ userId, roles, hasAdminAccess, tokens (encrypted),
   createdAt, lastSeenAt, csrfSecret }`. Adapters: **in-memory** (TTL map; dev/test, single process) and **Lakebase
   (PostgreSQL)** for production (`sessions` table, `expires_at` index, periodic purge). Idle timeout and absolute lifetime
   are env-configurable (defaults 30 min idle / 8 h absolute).
5. **Downstream tokens stay server-side.** Entra access/refresh tokens are stored only in the session record, encrypted at
   rest with a key from `SecretProvider` (Key Vault / Secret Scopes, L72); the Service Principal token for Databricks is held by
   the SQL Warehouse / Jobs adapters, never in the session and never in any response body or log (ADR-0006 redaction).
6. **CSRF.** Synchronizer token: `GET /api/v1/session` returns a `csrfToken` derived from the session's `csrfSecret`; every
   `POST|PUT|PATCH|DELETE` must send it in `X-CSRF-Token`, otherwise `403 ApiError { code: 'CSRF_INVALID' }`. `Origin` is also
   checked against the App origin as defence in depth.
7. **Session endpoint.** `GET /api/v1/session` returns user, role, `hasAdminAccess`, `requiresGate`, permissions and visible
   navigation (A-04) — never tokens.

## Alternatives considered

- **Tokens in the browser (SPA + MSAL, bearer to the BFF).** Violates L294 and L88. Rejected.
- **Stateless encrypted cookie session (JWE/iron-session).** No server store, but cookie size grows with Entra tokens
  (often > 4 KB), logout cannot revoke other copies, and rotation is harder. Rejected.
- **Redis session store.** Common, but not a service in this architecture (L62–74) and a new operational dependency on
  Databricks Apps. Rejected; Lakebase already is the transactional store.
- **`express-session` as-is.** Acceptable as the middleware under our `SessionStore` port if it fits; the decision is the port
  and the adapters, not the middleware.
- **Double-submit cookie CSRF.** Simpler, but weaker against subdomain cookie injection; synchronizer token is cheap with a
  server session. Rejected.
- **`SameSite=Strict`.** Would drop the cookie on the IdP redirect back and on links from e-mail/Teams. Rejected.

## Consequences

- Positive: the browser never holds credentials; logout and revocation are server-side; the store is swappable per environment.
- Positive: the mock IdP makes the full redirect flow testable (API E2E: PKCE params present, callback sets the cookie,
  POST without CSRF → 403, no token in any body — P4-08).
- Negative: every request reads the session (one Lakebase lookup in prod); mitigate with a short in-process cache keyed by
  session id.
- Negative: the in-memory adapter loses sessions on restart and does not share across instances — dev/test only; production
  config fails at start-up if `SESSION_STORE=memory` with `NODE_ENV=production`.
- Follow-ups: P4-08 (auth routes and session), P4-09 (RBAC from session roles), Entra registration (OQ-17).
