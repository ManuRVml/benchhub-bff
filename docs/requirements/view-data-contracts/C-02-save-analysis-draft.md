<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-02-save-analysis-draft.md · copied 2026-09-25 -->

# C-02 — Save analysis draft step

- Endpoint: `PATCH /api/v1/analysis-drafts/:draftId`
- Triggered from: SCR-07 "Definición del análisis" (5-step wizard) → autosave on step changes (HTML L445–718)
- Request (minimal JSON):
```json
{
  "step": 1,
  "fields": {
    "fieldName": "value"
  }
}
```
- Response:
```json
{
  "validationState": {
    "isValid": true,
    "errors": [
      { "field": "fieldName", "code": "required" }
    ]
  }
}
```
- Permission required: `analyst_creator` role; draft ownership or collaborative editing permission
- Validation / errors:
  - DRAFT_NOT_FOUND: draftId does not exist or user lacks access
  - INVALID_STEP: step must be between 1-5
  - VALIDATION_ERROR: field values fail business rule validation
  - FORBIDDEN: user cannot edit this draft
- Side effects: Updates draft state; triggers autosave; validates step fields; updates lastModified timestamp
- budgetBytes: 4096
