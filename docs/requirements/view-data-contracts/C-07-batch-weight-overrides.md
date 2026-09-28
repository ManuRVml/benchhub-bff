<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-07-batch-weight-overrides.md · copied 2026-09-25 -->

# C-07 — Batch update weight overrides

- Endpoint: `PATCH /api/v1/analyses/:analysisId/weight-overrides`
- Triggered from: SCR-08 "Resultados" → weight slider adjustments (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "weights": [
    {
      "indicatorId": "branded-id",
      "weight": 15
    }
  ]
}
```
- Response:
```json
{
  "saved": true,
  "warnings": [
    "Sum of weights (105%) exceeds 100%"
  ]
}
```
- Permission required: `analyst_creator` role; analysis ownership or collaborative editing permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - INVALID_WEIGHT: weight must be between 0 and 100
  - FORBIDDEN: user cannot edit this analysis
- Side effects: Saves weight overrides to database; recalculates weighted scores; returns warnings when sum ≠ 100 (BACKEND rule 2)
- budgetBytes: 4096
- Notes: Accepts and returns `warnings[]` when sum ≠ 100
