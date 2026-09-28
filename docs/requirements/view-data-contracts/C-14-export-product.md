<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-14-export-product.md · copied 2026-09-25 -->

# C-14 — Export analysis product

- Endpoint: `POST /api/v1/exports`
- Triggered from: SCR-08 "Resultados" → "Descargar" buttons (HTML L720–1078); SCR-14 "Presentación · detalle" → export options (HTML L2100–2595)
- Request (minimal JSON):
```json
{
  "kind": "report-summary-xlsx|value-monitor-pdf|presentation-pptx|presentation-pdf|strategic-plan|radar-png",
  "params": {
    "analysisId": "branded-id",
    "format": "optional-format-specific-options"
  }
}
```
- `params.analysisId` is optional: `radar-png` and `strategic-plan` (Monitor de Valor, SCR-11) export monitor-scoped
  products with no analysis context. Every other `kind` still requires it, except `presentation-pptx` /
  `presentation-pdf`, which are identified by `params.presentationId` (optional in the schema, required by the BFF
  handler for those two kinds and ignored for the rest). `analysisId` is not needed for presentation exports.
- Response:
```json
{
  "operationId": "branded-id",
  "status": "accepted"
}
```
- Permission required: `analyst_creator` role; analysis ownership or read permission
- Validation / errors:
  - INVALID_KIND: kind must be one of the allowed export types
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access (only when `kind` requires it)
  - PRESENTATION_NOT_FOUND: presentationId does not exist or user lacks access (only for presentation kinds)
  - FORBIDDEN: user cannot export this analysis
- Side effects: Initiates export job; generates file in requested format; stores in temporary location
- budgetBytes: 2048
- Notes: Long-running operation returns 202 with operationId; feature F37
