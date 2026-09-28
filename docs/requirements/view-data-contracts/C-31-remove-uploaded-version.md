<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-31-remove-uploaded-version.md · copied 2026-09-25 -->

# C-31 — Remove uploaded presentation version

- Endpoint: `DELETE /api/v1/presentations/:presentationId/uploaded-version`
- Triggered from: SCR-13 "Presentaciones" → "Quitar" button (HTML L2100–2595)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "removed": true,
  "versionId": "branded-id"
}
```
- Permission required: `analyst_creator` role; presentation ownership
- Validation / errors:
  - PRESENTATION_NOT_FOUND: presentationId does not exist or user lacks access
  - NO_UPLOADED_VERSION: presentation has no uploaded version to remove
  - FORBIDDEN: user cannot remove from this presentation
- Side effects: Removes uploaded version; reverts to builder-only presentation
- budgetBytes: 1024
- Notes: Feature F30
