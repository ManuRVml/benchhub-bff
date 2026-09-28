<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/O-05-ready.md · copied 2026-09-25 -->

# O-05 — Readiness probe

- Endpoint: `GET /api/v1/ready`
  Readiness — operational probe for the platform (Databricks Apps), the smoke tests of P6-03 and the `-mock` image (P4-41).
  Not called by the SPA.
- Screens: none (operations only). The SPA never shows this data.
- Params: none.
- Response (minimal JSON):
  ```json
  {
    "status": "degraded",
    "version": "0.1.0",
    "checks": [
      { "name": "session-store", "status": "ok" },
      { "name": "analytics-provider", "status": "ok" },
      { "name": "job-orchestrator", "status": "failing" }
    ]
  }
  ```
- Raw vs derived: `status` (`ok | degraded | failing`) is derived by the BFF from the checks. `version` is the package version.
  Check names are logical port names, never hostnames, connection strings or table names.
- Sections: n/a. `/ready` answers `503` when a required check fails, `200` otherwise.
- Permissions: public, no session and no CSRF. It exposes no user data, so a rate limit is enough.
- budgetBytes: 1024
- Commands used: none.
