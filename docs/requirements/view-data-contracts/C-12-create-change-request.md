<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-12-create-change-request.md · copied 2026-09-25 -->

# C-12 — Create change request

- Endpoint: `POST /api/v1/change-requests`
- Triggered from: SCR-08 "Resultados" → "Solicitar cambio" button on any entity (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "entityType": "analysis|indicator|company|section|value_monitor|presentation",
  "entityId": "branded-id",
  "text": "change-request-description",
  "kind": "data|scope|recalculation"
}
```
- Response:
```json
{
  "id": "branded-id",
  "createdAt": "2025-10-03T10:00:00Z",
  "status": "pending_review"
}
```
- Permission required: `analyst_creator` role; change request on any entity user can view
- Validation / errors:
  - INVALID_ENTITY_TYPE: entityType must be one of the allowed types
  - ENTITY_NOT_FOUND: entityId does not exist
  - TEXT_REQUIRED: text field is required
  - INVALID_KIND: kind must be one of data, scope, or recalculation
  - FORBIDDEN: user lacks permission to create change request
- Side effects: Creates change request record; initializes status to "pending_review"; may trigger notification to analysts
- budgetBytes: 2048
- Notes: Feature F33
