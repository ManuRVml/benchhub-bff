<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-32-generate-slide-comment.md · copied 2026-09-25 -->

# C-32 — Generate slide comment draft

- Endpoint: `POST /api/v1/slide-comment-drafts`
- Triggered from: SCR-13 "Presentaciones" → "Añadir comentario" on slides (HTML L2100–2595)
- Request (minimal JSON):
```json
{
  "presentationId": "branded-id",
  "slideKey": "slide-identifier",
  "language": "es|en"
}
```
- Response:
```json
{
  "text": "generated-comment-text",
  "status": "suggestion",
  "generatedBy": {
    "model": "mock-llm",
    "version": "1"
  }
}
```
- Permission required: `analyst_creator` role; presentation ownership or read permission
- Validation / errors:
  - PRESENTATION_NOT_FOUND: presentationId does not exist or user lacks access
  - SLIDE_NOT_FOUND: slideKey does not exist in presentation
  - INVALID_LANGUAGE: language must be es or en
  - FORBIDDEN: user cannot generate comment for this presentation
- Side effects: Generates slide comment via LLM; stores as suggestion
- budgetBytes: 8192
- Notes: LLM-backed; batch client-side up to 8; feature F29
