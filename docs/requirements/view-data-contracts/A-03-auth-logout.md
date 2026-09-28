<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/A-03-auth-logout.md · copied 2026-09-25 -->

# A-03 — Logout

- Endpoint: `POST /api/v1/auth/logout`
  `X-XSRF-TOKEN` header required (double-submit of the `XSRF-TOKEN` cookie). Destroys the server session and its tokens,
  clears both cookies, answers `204`; the SPA then navigates to `/login`. Optional IdP front-channel sign-out is a BFF
  decision (ADR P2-B06) [inference].
- Screens: SCR-04 App shell sidebar "Salir"; SCR-02 Access gate "Cerrar sesión"; SCR-03 Admin back link path via the gate.
- Params: none (no path/query params; nothing in the URL).
- Response (minimal JSON): success is `204 No Content`. Error body when the CSRF header is missing or wrong (`403`); the
  button stops its busy state and the user stays signed in:
  ```json
  {
    "error": {
      "code": "CSRF_INVALID",
      "messageKey": "auth.error.csrfInvalid",
      "traceId": "01J9ZK4B2C7M5P8Q1S3VWX6Y9Z"
    }
  }
  ```
- Raw vs derived: none.
- Sections: n/a.
- Permissions: any authenticated session; an expired session also answers `204` (idempotent) so "Salir" always ends on
  `/login`.
- budgetBytes: 256
- Commands used: none.
