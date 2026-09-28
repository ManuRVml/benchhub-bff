<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-35-mark-notification-read.md · copied 2026-09-25 -->

# C-35 — Mark notification as read

- Endpoint: `PATCH /api/v1/notifications/:notificationId/read`
- Triggered from: SCR-15 "Notificaciones" → notification card click (HTML L2943–2990)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "read": true,
  "notificationId": "branded-id",
  "readAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; notification ownership or read permission
- Validation / errors:
  - NOTIFICATION_NOT_FOUND: notificationId does not exist or user lacks access
  - ALREADY_READ: notification is already marked as read
  - FORBIDDEN: user cannot mark this notification as read
- Side effects: Marks notification as read; updates readAt timestamp; decrements unread count
- budgetBytes: 1024
- Notes: Feature F34
