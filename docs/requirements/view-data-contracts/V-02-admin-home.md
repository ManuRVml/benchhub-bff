<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-02-admin-home.md · copied 2026-09-25 -->

# V-02 — Admin home (back-office placeholder cards)

- Endpoint: `GET /api/v1/views/admin-home`
  The five back-office modules and their availability. v1: every module is unavailable (SCR-03 placeholder).
- Screens: SCR-03 Administración · Back office — grid of 5 cards.
- Params: none (route `/admin`, no query).
- Response (minimal JSON):
  ```json
  {
    "cards": [
      { "id": "users-roles", "isAvailable": false },
      { "id": "data-sources", "isAvailable": false },
      { "id": "companies-peers", "isAvailable": false },
      { "id": "system-parameters", "isAvailable": false },
      { "id": "audit", "isAvailable": false }
    ],
    "permissions": {
      "canManageUsers": false,
      "canManageDataSources": false,
      "canManageCompanies": false,
      "canManageParameters": false,
      "canViewAudit": false
    }
  }
  ```
- Raw vs derived: no numbers. Card titles, descriptions and icons come from i18n keyed by `id` (SCR-03). The BFF derives
  `isAvailable` (module shipped and the user holds the matching `canManage*` flag).
- Sections: single list; the fixed set of 5 has no partial state. On failure the grid shows `Cmp:SectionError` with retry.
- Permissions: route and endpoint need `hasAdminAccess` (A-04), otherwise `403` → SCR-17. Flags `canManageUsers`,
  `canManageDataSources`, `canManageCompanies`, `canManageParameters`, `canViewAudit` (all false in v1) prepare the future
  sub-routes.
- budgetBytes: 1024
- Commands used: A-03 (back to the gate / logout path); no admin commands in v1.
