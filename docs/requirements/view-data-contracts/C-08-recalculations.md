<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-08-recalculations.md · copied 2026-09-25 -->

# C-08 — Recalculate analysis or monitor

- Endpoint: `POST /api/v1/recalculations`
- Triggered from: SCR-08 "Resultados" / SCR-11 "Monitor de Valor" → "Recalcular" button (HTML L720–1078, L1685–2098)
- Request (minimal JSON):
```json
{
  "analysisId": "branded-id",
  "monitor": "optional-boolean-if-analysisId-absent",
  "reason": "user-edited-values|external-data-update|manual-trigger",
  "changeRequestId": "optional-branded-id"
}
```
- Response:
```json
{
  "operationId": "branded-id",
  "status": "accepted"
}
```
- Permission required: `analyst_creator` role; analysis ownership or collaborative editing permission
- Validation / errors:
  - MISSING_CONTEXT: either analysisId or monitor flag required
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - FORBIDDEN: user cannot recalculate this analysis
- Side effects: Initiates recalculation job; updates metrics with current values and overrides; records change if changeRequestId provided
- budgetBytes: 2048
- Notes: Long-running operation returns 202 with operationId; feature F22
