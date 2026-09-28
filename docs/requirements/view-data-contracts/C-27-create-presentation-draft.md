<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-27-create-presentation-draft.md · copied 2026-09-25 -->

# C-27 — Create presentation draft

- Endpoint: `POST /api/v1/presentations`
- Triggered from: SCR-13 "Presentaciones" → "Nueva presentación" button (HTML L2100–2595)
- Request (minimal JSON):
```json
{
  "analysisId": "branded-id"
}
```
- Response:
```json
{
  "id": "branded-id",
  "createdAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; analysis ownership or read permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - FORBIDDEN: user cannot create presentation for this analysis
- Side effects: Creates new presentation draft with analysis context
- budgetBytes: 2048
- Notes: Feature F29
