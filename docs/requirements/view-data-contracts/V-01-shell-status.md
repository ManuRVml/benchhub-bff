<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-01-shell-status.md · copied 2026-09-25 -->

# V-01 — Shell status (unread notifications badge)

- Endpoint: `GET /api/v1/views/shell-status`
  Small, frequently refreshed read, independent of A-04. It is refetched on window focus, after C-35/C-36, and every 60 s
  [inference]. `ETag` + `Cache-Control: private, no-cache`.
- Screens: SCR-04 App shell — sidebar "Notificaciones" count badge (expanded), 8px red dot (collapsed), header bell dot.
- Params: none.
- Response (minimal JSON):
  ```json
  {
    "unreadNotifications": 11,
    "permissions": {}
  }
  ```
- Raw vs derived: `unreadNotifications` is a count derived by the BFF (integer ≥ 0; mock 11 = `ALERTS.length`). The front
  renders it as an integer and caps the display at "99+" [inference]. With 0, no badge, no collapsed dot and no bell dot
  (SCR-04).
- Sections: single value. A failure only hides the badge; the shell keeps working (non-blocking, SCR-04 States).
- Permissions: none (empty `ActionPermissions`); every authenticated role sees its own count.
- budgetBytes: 256
- Commands used: none (C-35 / C-36 change the count; they are specified with V-44).
