<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-01-create-analysis-draft.md · copied 2026-09-25 -->

# C-01 — Create analysis draft

- Endpoint: `POST /api/v1/analysis-drafts`
- Triggered from: SCR-06 "Todos los análisis creados" → "+ Crear nuevo análisis" button (HTML L387)
- Request (minimal JSON):
```json
{
  "type": "desempeno_comparativo|referentes_estrategicos|generacion_valor",
  "fromAnalysisId": "optional-branded-id"
}
```
- Response:
```json
{
  "draftId": "drf_01J9ZA2B3C"
}
```
- Permission required: `analyst_creator` role only; `permissions.canCreate` must be true
- Validation / errors:
  - MISSING_TYPE: type field required
  - INVALID_TYPE: type must be one of the allowed analysis types
  - FORBIDDEN: user lacks permission to create analyses
  - ANALYSIS_NOT_FOUND: fromAnalysisId references non-existent analysis
- Side effects: Creates new analysis draft with initial state; if fromAnalysisId provided, copies configuration from source analysis
- budgetBytes: 2048
