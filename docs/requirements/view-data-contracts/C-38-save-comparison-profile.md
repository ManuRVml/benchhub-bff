<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-38-save-comparison-profile.md · copied 2026-09-25 -->

# C-38 — Save comparison profile

- Endpoint: `POST /api/v1/analyses/:analysisId/comparison-profiles`
- Triggered from: SCR-06 "Análisis" → "Gestionar perfiles de comparación" (synthesis P4-22 row)
- Request (minimal JSON):
```json
{
  "name": "profile-name",
  "description": "optional-description",
  "companyIds": ["branded-id", "branded-id"],
  "isDefault": false
}
```
- Response:
```json
{
  "saved": true,
  "profileId": "branded-id",
  "createdAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; analysis ownership
- Validation / errors:
  - NAME_REQUIRED: name field is required
  - COMPANY_NOT_FOUND: at least one companyIds does not exist in analysis
  - DUPLICATE_NAME: profile with this name already exists
  - FORBIDDEN: user cannot create profiles for this analysis
- Side effects: Creates comparison profile record; stores company list and metadata
- budgetBytes: 4096
- Notes: Feature F17
