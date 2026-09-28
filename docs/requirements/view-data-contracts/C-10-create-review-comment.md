<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-10-create-review-comment.md · copied 2026-09-25 -->

# C-10 — Create review comment

- Endpoint: `POST /api/v1/review-comments`
- Triggered from: SCR-08 "Resultados" → comment icon on any entity (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "entityType": "analysis|indicator|company|section|value_monitor|presentation",
  "entityId": "branded-id",
  "text": "comment-content",
  "parentId": "optional-branded-id-for-reply"
}
```
- Response:
```json
{
  "id": "branded-id",
  "createdAt": "2025-10-03T10:00:00Z",
  "status": "pending"
}
```
- Permission required: `analyst_creator` role; comment on any entity user can view
- Validation / errors:
  - INVALID_ENTITY_TYPE: entityType must be one of the allowed types
  - ENTITY_NOT_FOUND: entityId does not exist
  - TEXT_REQUIRED: text field is required
  - FORBIDDEN: user lacks permission to comment on this entity
- Side effects: Creates review comment record; initializes status to "pending"; if parentId provided, establishes reply thread
- budgetBytes: 2048
- Notes: Feature F32
