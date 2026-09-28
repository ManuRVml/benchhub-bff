<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-39-update-comparison-profile.md · copied 2026-09-25 -->

# C-39 — Update comparison profile

- Endpoint: `PATCH /api/v1/analyses/:analysisId/comparison-profiles/:profileId`
- Triggered from: SCR-06 "Análisis" → profile edit modal (synthesis P4-22 row)
- Request (minimal JSON):
```json
{
  "name": "updated-name",
  "description": "optional-updated-description",
  "companyIds": ["branded-id", "branded-id"],
  "isDefault": true
}
```
- Response:
```json
{
  "saved": true,
  "profileId": "branded-id",
  "updatedAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; profile ownership or analysis ownership
- Validation / errors:
  - PROFILE_NOT_FOUND: profileId does not exist or user lacks access
  - COMPANY_NOT_FOUND: at least one companyIds does not exist in analysis
  - DUPLICATE_NAME: profile with this name already exists (other than self)
  - FORBIDDEN: user cannot update this profile
- Side effects: Updates comparison profile record; modifies company list and metadata
- budgetBytes: 4096
- Notes: Feature F17
