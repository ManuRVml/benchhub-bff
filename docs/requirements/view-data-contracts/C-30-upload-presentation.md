<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-30-upload-presentation.md · copied 2026-09-25 -->

# C-30 — Upload presentation version

- Endpoint: `PUT /api/v1/presentations/:presentationId/uploaded-version`
- Triggered from: SCR-13 "Presentaciones" → "Cargar PPT" button (HTML L2100–2595)
- Request (minimal JSON):
```json
{}
```
- Request (multipart/form-data): binary .ppt or .pptx file ≤ 50 MB
- Response:
```json
{
  "uploaded": true,
  "versionId": "branded-id",
  "fileName": "presentation.pptx"
}
```
- Permission required: `analyst_creator` role; presentation ownership
- Validation / errors:
  - PRESENTATION_NOT_FOUND: presentationId does not exist or user lacks access
  - FILE_TOO_LARGE: file exceeds 50 MB limit
  - INVALID_FILE_TYPE: file must be .ppt or .pptx
  - MIME_MISMATCH: file MIME type does not match extension
  - MAGIC_BYTE_FAILURE: file magic bytes do not indicate valid PowerPoint
  - FORBIDDEN: user cannot upload to this presentation
- Side effects: Validates file with MIME type and magic byte check; stores uploaded version; updates presentation metadata
- budgetBytes: 52428800
- Notes: Feature F30
