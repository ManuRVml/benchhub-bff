<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-11-update-review-comment.md · copied 2026-09-25 -->

# C-11 — Update review comment status

- Endpoint: `PATCH /api/v1/review-comments/:commentId`
- Triggered from: SCR-08 "Resultados" → comment status dropdown (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "status": "pending|in_analysis|resolved"
}
```
- Response:
```json
{
  "id": "branded-id",
  "status": "resolved",
  "updatedAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; comment ownership or admin permission
- Validation / errors:
  - COMMENT_NOT_FOUND: commentId does not exist or user lacks access
  - INVALID_STATUS: status must be one of the allowed values
  - FORBIDDEN: user cannot update this comment
- Side effects: Updates comment status; records update timestamp; if status changes to "resolved", may trigger notification to comment author
- budgetBytes: 1024
- Notes: Feature F32
