<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-28-update-presentation-builder.md · copied 2026-09-25 -->

# C-28 — Update presentation builder

- Endpoint: `PATCH /api/v1/presentations/:presentationId`
- Triggered from: SCR-13 "Presentaciones" → autosave on builder changes (HTML L2100–2595)
- Request (minimal JSON):
```json
{
  "meta": {
    "title": "presentation-title",
    "date": "2026-04-30",
    "language": "es",
    "templateId": "directorio"
  },
  "modules": [
    {
      "id": "comp",
      "charts": [
        {
          "id": "barras",
          "isSelected": true
        }
      ]
    }
  ],
  "includeCover": true,
  "includeClosing": true,
  "notes": {
    "comp|barras": "optional note"
  }
}
```
- Request notes: partial V-41 builder state; every top-level key is optional (PATCH autosave, CF-109).
- Response:
```json
{
  "meta": {
    "title": "presentation-title",
    "date": "2026-04-30",
    "language": "es",
    "templateId": "directorio"
  },
  "modules": [
    {
      "id": "comp",
      "charts": [
        {
          "id": "barras",
          "isSelected": true
        }
      ]
    }
  ],
  "includeCover": true,
  "includeClosing": true,
  "notes": {
    "comp|barras": "optional note"
  }
}
```
- Permission required: `analyst_creator` role; presentation ownership or collaborative editing permission
- Validation / errors:
  - PRESENTATION_NOT_FOUND: presentationId does not exist or user lacks access
  - INVALID_TEMPLATE: templateId must be valid
  - FORBIDDEN: user cannot edit this presentation
- Side effects: Updates presentation builder state; PATCH merges only the provided keys (autosave).
- budgetBytes: 16384
- Notes: Feature F29/F30
