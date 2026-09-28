<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-22-validate-sensitivity-suggestion.md · copied 2026-09-25 -->

# C-22 — Validate sensitivity suggestion

- Endpoint: `POST /api/v1/sensitivity-suggestions/:suggestionId/validation`
- Triggered from: SCR-12 "Sensibilidades" → "Validar sugerencia" button (HTML L1466–1683)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "suggestionId": "branded-id",
  "validatedBy": "branded-user-id",
  "validatedAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; suggestion ownership or admin permission
- Validation / errors:
  - SUGGESTION_NOT_FOUND: suggestionId does not exist or user lacks access
  - ALREADY_VALIDATED: suggestion already has validatedBy timestamp
  - FORBIDDEN: user cannot validate this suggestion
- Side effects: Records validation timestamp and user; marks suggestion as validated
- budgetBytes: 1024
- Notes: Feature F27
