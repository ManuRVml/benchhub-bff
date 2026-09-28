<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/O-04-health-ready.md · copied 2026-09-25 -->

# O-04 — Health probe

- Endpoint: `GET /api/v1/health`
  Liveness — operational probe for the platform (Databricks Apps), the smoke tests of P6-03 and the `-mock` image (P4-41).
  Not called by the SPA.
- Screens: none (operations only). The SPA never shows this data.
- Params: none.
- Response (minimal JSON): `{ "status": "ok", "version": "…" }`:
  ```json
  {
    "status": "ok",
    "version": "0.1.0"
  }
  ```
- Raw vs derived: `status` is always `ok` for liveness; `version` is the package version.
- Sections: n/a. `/health` always answers `200`.
- Permissions: public, no session and no CSRF. It exposes no user data, so a rate limit is enough.
- budgetBytes: 1024
- Commands used: none.
