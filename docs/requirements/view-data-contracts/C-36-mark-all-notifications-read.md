<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-36-mark-all-notifications-read.md · copied 2026-09-25 -->

# C-36 — Mark all notifications as read

- Endpoint: `POST /api/v1/notifications/read-all`
- Triggered from: SCR-15 "Notificaciones" → "Marcar todo como leído" button (HTML L2943–2990)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "read": true,
  "count": 11
}
```
- Permission required: `analyst_creator` role; any authenticated user with notification access
- Validation / errors:
  - FORBIDDEN: user lacks notification access
- Side effects: Marks all visible notifications as read; updates readAt timestamps; resets unread count to 0
- budgetBytes: 1024
- Notes: Feature F34
