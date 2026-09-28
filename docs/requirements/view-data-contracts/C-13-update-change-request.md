<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-13-update-change-request.md · copied 2026-09-25 -->

# C-13 — Update change request decision

- Endpoint: `PATCH /api/v1/change-requests/:requestId`
- Triggered from: SCR-08 "Resultados" → change request decision dropdown (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "decision": "accepted|rejected",
  "note": "optional-explanation"
}
```
- Response:
```json
{
  "id": "branded-id",
  "decision": "accepted",
  "note": "accepted-explanation",
  "updatedAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; change request ownership or admin permission
- Validation / errors:
  - REQUEST_NOT_FOUND: requestId does not exist or user lacks access
  - INVALID_DECISION: decision must be accepted or rejected
  - FORBIDDEN: user cannot update this change request
- Side effects: Updates change request status and decision; if accepted, may trigger C-08 recalculation (F22); records decision timestamp and optional note
- budgetBytes: 2048
- Notes: Feature F33; accepted may trigger C-08
