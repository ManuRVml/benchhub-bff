<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/A-01-auth-login.md · copied 2026-09-25 -->

# A-01 — Login redirect (Entra ID, authorization code + PKCE)

- Endpoint: `GET /api/v1/auth/login?returnTo=&loginHint=`
  Full-page browser navigation (not `fetch`); answers `302` to the Entra ID authorize URL. Token-handler pattern (brief
  §4.1 rule 9): the BFF generates `state`, `nonce` and the PKCE `code_verifier`, keeps them in a short-lived HttpOnly
  transaction cookie, and sends only `code_challenge` (S256) to the IdP.
- Screens: SCR-01 Login, button "Ingresar" (the browser leaves the SPA); also every 401 anywhere in the app redirects to
  SCR-01 first, and SCR-01 calls this endpoint again.
- Params:
  - `returnTo` (query, optional, default `/inicio`): relative in-app path to open after login. Only same-origin relative paths
    (`/…`, not `//…`) are accepted; anything else falls back to `/inicio`, silently.
  - `loginHint` (query, optional): the value typed in "Usuario o correo corporativo", trimmed, forwarded as `login_hint`.
    No client validation beyond trim (SCR-01).
  - Nothing is stored in the SPA URL besides `/login?returnTo=&error=` (SCR-01 route).
- Response (minimal JSON): success is `302` with `Location` (no body). The only JSON the SPA can see is the `ApiError` body
  when the IdP metadata cannot be loaded (`503`); the login page then shows its error banner:
  ```json
  {
    "error": {
      "code": "AUTH_PROVIDER_UNAVAILABLE",
      "messageKey": "auth.error.providerUnavailable",
      "traceId": "01J9ZK3T6W8Q2V5N4R7XHB0C1D"
    }
  }
  ```
- Raw vs derived: no business numbers. The BFF derives the IdP URL, `state`, `nonce` and PKCE values; the front only builds
  `returnTo` / `loginHint`.
- Sections: n/a (redirect, single outcome). Failure is complete: the login page stays and shows `error`.
- Permissions: public (no session required). No `ActionPermissions` object; an already authenticated call still redirects
  through the IdP (SSO makes it silent).
- budgetBytes: 512
- Commands used: A-02 (IdP callback, next step of the same flow).
