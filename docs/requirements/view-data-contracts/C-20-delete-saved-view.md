<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-20-delete-saved-view.md · copied 2026-09-25 -->

# C-20 — Delete saved view

- Endpoint: `DELETE /api/v1/saved-views/:viewId`
- Triggered from: SCR-05 "Inicio" / SCR-08 "Resultados" → "X" delete button on saved view (HTML L246–381, L720–1078)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "deleted": true,
  "viewId": "branded-id"
}
```
- Permission required: `analyst_creator` role; view ownership
- Validation / errors:
  - VIEW_NOT_FOUND: viewId does not exist or user lacks access
  - FORBIDDEN: user cannot delete this view
- Side effects: Removes saved view record; clears user preference
- budgetBytes: 1024
- Notes: Feature F36
