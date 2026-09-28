<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-06-batch-value-overrides.md · copied 2026-09-25 -->

# C-06 — Batch update value overrides

- Endpoint: `PATCH /api/v1/analyses/:analysisId/value-overrides`
- Triggered from: SCR-08 "Resultados" → manual value edits on indicator cards (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "overrides": [
    {
      "companyId": "branded-id",
      "indicatorId": "branded-id",
      "value": "number|null",
      "isEstimate": true,
      "justification": "optional-string"
    }
  ]
}
```
- Response:
```json
{
  "saved": true,
  "overrideCount": 3
}
```
- Permission required: `analyst_creator` role; analysis ownership or collaborative editing permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - INVALID_OVERRIDE: each override must have companyId, indicatorId, and value
  - FORBIDDEN: user cannot edit this analysis
- Side effects: Saves value overrides to database; triggers recalculation of dependent metrics; updates override metadata (timestamp, user)
- budgetBytes: 8192
- Notes: Autosave debounce 500 ms; keeps original value for reference
