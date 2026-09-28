<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/A-02-auth-callback.md · copied 2026-09-25 -->

# A-02 — Login callback (session creation)

- Endpoint: `GET /api/v1/auth/callback?code=&state=`
  Called by Entra ID, never by the SPA. Exchanges the code with the stored PKCE verifier, validates `state`/`nonce` and
  the ID token, maps Entra groups to the role and `hasAdminAccess` (§1.19), stores tokens server-side only, sets the
  session cookie (`HttpOnly; Secure; SameSite=Lax; Path=/`) and the readable `XSRF-TOKEN` cookie (double-submit CSRF),
  then answers `302`.
- Screens: none rendered; the redirect lands on SCR-02 Access gate (`/acceso`, when `hasAdminAccess`), `returnTo`, or SCR-05
  Inicio. Failures land on SCR-01 with `?error=`.
- Params:
  - `code`, `state` (query, from the IdP; required).
  - `error`, `error_description` (query, from the IdP when the user cancels or is not assigned).
  - The final SPA URL carries only the target route, or `/login?error=<code>&returnTo=` on failure.
- Response (minimal JSON): no body (`302`). The JSON below is the redirect decision the SPA observes (the `Location`
  target), shown as data because it drives SCR-01/SCR-02:
  ```json
  {
    "location": "/login?error=access_denied&returnTo=%2Finicio",
    "loginErrorCodes": [
      "access_denied",
      "session_expired",
      "idp_error",
      "unknown"
    ]
  }
  ```
- Raw vs derived: the BFF derives the redirect target: `/acceso` when `hasAdminAccess` and `requiresGate`, else `returnTo`,
  else `/inicio`. It also maps IdP errors to the 4 SCR-01 error codes (i18n on the front). No numbers.
- Sections: n/a (single redirect).
- Permissions: public endpoint; access is decided here (no Entra group → `access_denied`).
- budgetBytes: 512
- Commands used: none (A-04 is the first SPA call after landing).
