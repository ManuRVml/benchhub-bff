<!-- origin: authored for AUTH-PASSWORD (owner decision 2026-09-28) · mirrored in eco-comparator-web docs/design/view-data-contracts/A-05-password-login.md -->

# A-05 — Mock password login

- Endpoint: `POST /api/v1/auth/password-login`
  JSON `fetch` from the SPA (never a URL: the password travels only in the body). Owner decision 2026-09-28, which
  overrides CF-29: the SCR-01 card shows the prototype's "Contraseña" field. Only the mock BFF serves this endpoint and it
  checks one configured credential pair (`MOCK_LOGIN_USERNAME` / `MOCK_LOGIN_PASSWORD`, defaults
  `ecopetrol@ecopetrol.com` / `ecopetrol`). The production target stays Entra ID / OIDC (A-01, A-02).
- Screens: SCR-01 Login, button "Ingresar".
- Params: none (no path/query params).
- Request (minimal JSON): `username` is an e-mail, trimmed, at most 254 characters, compared case-insensitively;
  `password` has 1..128 characters, is compared exactly and in constant time, and is never logged. No other field.
  ```json
  {
    "username": "ecopetrol@ecopetrol.com",
    "password": "ecopetrol"
  }
  ```
- Response (minimal JSON): `200` sets the session cookie and the synchronizer CSRF token exactly as the A-01 → A-02 flow
  does, and the body is the A-04 session of the signed-in user (`csrfToken` included). The SPA then opens `returnTo` (or
  `/inicio`) and runs its usual A-04 bootstrap:
  ```json
  {
    "user": {
      "id": "usr_01J9Y7C2QK",
      "displayName": "Camila Bravo",
      "avatarFileId": "fil_01J9Y7C4AV",
      "roleLabelKey": "role.analystCreator"
    },
    "role": "analyst_creator",
    "hasAdminAccess": false,
    "requiresGate": false,
    "navigation": [
      {
        "id": "inicio",
        "labelKey": "nav.inicio",
        "to": "/inicio",
        "isLocked": false
      }
    ],
    "analysisContext": { "defaultAnalysisId": "ana_01J9Y8D4T2" },
    "permissions": {
      "canUseAssistant": true,
      "canCreateAnalysis": true,
      "canViewAnalysisList": true,
      "canUseAnalysisTabs": true
    },
    "csrfToken": "4f1c2b9d8e7a6f5c4b3a29181716151413121110"
  }
  ```
- Errors: wrong password and unknown user both answer `401` with the same common ApiError body,
  `{ "code": "INVALID_CREDENTIALS", "message": "The username or password is incorrect", "traceId": "…" }`: it never says
  which field was wrong. A malformed body (missing field, not an e-mail, extra field, empty password) answers `400`
  `BAD_REQUEST`. The global rate limit applies.
- Raw vs derived: none; the BFF derives the session (role from `MOCK_ROLE`).
- Sections: n/a (single object, same as A-04).
- Permissions: public (no session and no CSRF token required: it is the login).
- budgetBytes: 4096
- Commands used: A-04 (session bootstrap after the redirect), A-03 (logout).
