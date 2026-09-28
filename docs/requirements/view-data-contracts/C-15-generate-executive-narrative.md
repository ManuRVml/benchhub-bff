<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-15-generate-executive-narrative.md · copied 2026-09-25 -->

# C-15 — Generate executive narrative

- Endpoint: `POST /api/v1/executive-narratives`
- Triggered from: SCR-08 "Resultados" → "Generar narrativa" button (HTML L720–1078); SCR-11 "Monitor de Valor" → narrative pill (HTML L1685–2098)
- Request (minimal JSON):
```json
{
  "scope": "results|value-monitor",
  "section": "overview|performance|trends|recommendations",
  "analysisId": "branded-id"
}
```
- `analysisId` required unless `scope` is `value-monitor`, where it is omitted (CF-102).
- Response:
```json
{
  "sections": [
    {
      "title": "section-title",
      "text": "generated-content"
    }
  ],
  "status": "suggestion",
  "generatedBy": {
    "model": "mock-llm",
    "version": "1"
  }
}
```
- Permission required: `analyst_creator` role; analysis ownership or read permission
- Validation / errors:
  - INVALID_SCOPE: scope must be results or value-monitor
  - INVALID_SECTION: section must be one of the allowed types
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - FORBIDDEN: user cannot generate narrative for this analysis
- Side effects: Generates narrative content using templates or LLM; stores as suggestion; marks generatedBy as template or llm
- budgetBytes: 8192
- Notes: Feature F18
