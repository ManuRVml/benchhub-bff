<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-29-publish-presentation.md · copied 2026-09-25 -->

# C-29 — Publish presentation

- Endpoint: `POST /api/v1/presentations/:presentationId/publication`
- Triggered from: SCR-13 "Presentaciones" → "Publicar" button (HTML L2100–2595)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "published": true,
  "publicationId": "branded-id",
  "publishedAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; presentation ownership
- Validation / errors:
  - PRESENTATION_NOT_FOUND: presentationId does not exist or user lacks access
  - NOT_COMPLETE: presentation missing required modules or content
  - FORBIDDEN: user cannot publish this presentation
- Side effects: Marks presentation as published; makes it publicly accessible; triggers notifications to invited viewers
- budgetBytes: 2048
- Notes: Feature F30
