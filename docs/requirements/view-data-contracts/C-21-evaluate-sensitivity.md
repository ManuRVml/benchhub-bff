<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-21-evaluate-sensitivity.md · copied 2026-09-25 -->

# C-21 — Evaluate sensitivity

- Endpoint: `POST /api/v1/sensitivity-evaluations`
- Triggered from: SCR-12 "Sensibilidades" → "Evaluar" button (HTML L1466–1683)
- Request (minimal JSON):
```json
{
  "indicatorId": "branded-id",
  "levers": [
    {
      "leverId": "branded-id",
      "value": "number"
    }
  ]
}
```
- Response:
```json
{
  "base": {
    "indicatorId": "branded-id",
    "value": 100
  },
  "simulated": {
    "value": 115
  },
  "target": 120,
  "gap": 5,
  "linked": [
    {
      "indicatorId": "branded-id",
      "variation": 0.05
    }
  ]
}
```
- Permission required: `analyst_creator` role; analysis ownership or read permission
- Validation / errors:
  - INDICATOR_NOT_FOUND: indicatorId does not exist or user lacks access
  - INVALID_LEVER: lever values must be valid numeric ranges
  - FORBIDDEN: user cannot evaluate sensitivity for this analysis
- Side effects: Performs stateless sensitivity calculation; returns simulated values and impact on linked indicators
- budgetBytes: 4096
- Notes: Debounced client-side; feature F27
