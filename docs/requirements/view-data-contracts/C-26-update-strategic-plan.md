<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-26-update-strategic-plan.md · copied 2026-09-25 -->

# C-26 — Update strategic plan

- Endpoint: `PATCH /api/v1/strategic-plans/:planId`
- Triggered from: SCR-12 "Sensibilidades" → "Guardar en el análisis" button (HTML L1466–1683)
- Request (minimal JSON):
```json
{
  "plan": {
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
- Response:
```json
{
  "saved": true,
  "planId": "branded-id"
}
```
- Prose for request rows (same as C-25 response rows):
  - `kviId` (string, branded) — KVI identifier.
  - `indicatorLabel` (string) — human-readable KVI name.
  - `urgency` (enum) — `"high"|"medium"|"low"`.
  - `gapPts` (number) — absolute gap in percentage points vs peers.
  - `weightPct` (number, 0..100) — KVI weight in the dimension, per CF-99.
  - `action` (string) — BFF-generated recommendation text.
  - `termDays` (number) — suggested horizon in days.
- Permission required: `analyst_creator` role; plan ownership or analysis ownership
- Validation / errors:
  - PLAN_NOT_FOUND: planId does not exist or user lacks access
  - FORBIDDEN: user cannot update this strategic plan
- Side effects: Updates strategic plan in analysis; persists plan rows as actionable items
- budgetBytes: 4096
- Notes: Feature F28
