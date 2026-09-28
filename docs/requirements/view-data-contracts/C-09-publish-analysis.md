<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-09-publish-analysis.md · copied 2026-09-25 -->

# C-09 — Publish analysis

- Endpoint: `POST /api/v1/publications`
- Triggered from: SCR-08 "Resultados" → "Publicar" button (HTML L720–1078); SCR-14 "Presentación · detalle" → "Publicar" button (HTML L2100–2595)
- Request (minimal JSON):
```json
{
  "analysisId": "branded-id",
  "products": ["report", "presentation"]
}
```
- Response:
```json
{
  "publicationManifest": {
    "id": "branded-id",
    "status": "published",
    "createdAt": "2025-10-03T10:00:00Z",
    "products": ["report", "presentation"]
  }
}
```
- Permission required: `analyst_creator` role; analysis ownership; publication permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - INVALID_PRODUCTS: products array must contain valid product types
  - FORBIDDEN: user cannot publish this analysis
  - ALREADY_PUBLISHED: analysis already has active publication
- Side effects: Creates immutable PublicationManifest; sets lifecycleState to "published"; triggers notifications to invited reviewers; makes analysis publicly accessible
- budgetBytes: 4096
