<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-25-generate-strategic-plan.md · copied 2026-09-25 -->

# C-25 — Generate strategic plan

- Endpoint: `POST /api/v1/strategic-plans`
- Triggered from: SCR-12 "Sensibilidades" → "Generar plan estratégico" button (HTML L1466–1683)
- Request (minimal JSON):
```json
{
  "fromSimulationId": "optional-branded-id"
}
```
- Response:
```json
{
  "plan": {
    "planId": "plan_1",
    "status": "suggestion",
    "rows": [
      {
        "kviId": "kvi_roace",
        "indicatorLabel": "ROACE",
        "urgency": "high",
        "gapPts": 15,
        "weightPct": 20,
        "action": "Plan de choque: revisar drivers operativos y de costo del indicador",
        "termDays": 30
      }
    ]
  }
}
```
- Prose:
  - `planId` (string, branded) — unique identifier for the strategic plan, used to PATCH updates.
  - `status` (enum) — `"suggestion"` for new plans; `"committed"` after user acceptance.
  - `rows[]` — strategic actions for high-gap KVIs:
    - `kviId` (string, branded) — KVI identifier.
    - `indicatorLabel` (string) — human-readable KVI name.
    - `urgency` (enum) — `"high"|"medium"|"low"`; driven by gap size and strategic importance.
    - `gapPts` (number) — absolute gap in percentage points vs peers.
    - `weightPct` (number, 0..100) — KVI weight in the dimension, per CF-99.
    - `action` (string) — BFF-generated recommendation text.
    - `termDays` (number) — suggested horizon in days (30 for quick wins, 90 for structural changes).
- Permission required: `analyst_creator` role; analysis ownership or read permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysis context does not exist or user lacks access
  - SIMULATION_NOT_FOUND: fromSimulationId does not exist
  - FORBIDDEN: user cannot generate strategic plan for this analysis
- Side effects: Generates strategic plan from simulation; returns suggestion rows with urgency, gap, weight, and suggested timeline
- budgetBytes: 8192
- Notes: Feature F28
