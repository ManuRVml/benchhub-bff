<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-23-save-sensitivity-simulation.md · copied 2026-09-25 -->

# C-23 — Save sensitivity simulation

- Endpoint: `POST /api/v1/sensitivity-simulations`
- Triggered from: SCR-12 "Sensibilidades" → "Guardar simulación" button (HTML L1466–1683)
- Request (minimal JSON):
```json
{
  "simulationData": {
    "indicatorId": "branded-id",
    "scenarios": [
      {
        "name": "Baseline",
        "levers": [
          { "leverId": "branded-id", "value": 100 }
        ],
        "simulatedValue": 120
      }
    ]
  }
}
```
- Response:
```json
{
  "saved": true,
  "simulationId": "branded-id"
}
```
- Permission required: `analyst_creator` role; analysis ownership or collaborative editing permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysis context does not exist or user lacks access
  - INVALID_SIMULATION: simulation data structure is invalid
  - FORBIDDEN: user cannot save simulation for this analysis
- Side effects: Saves simulation data to analysis (never overwrites real values); stores simulation metadata
- budgetBytes: 8192
- Notes: Does not overwrite real values; feature F27/F28
