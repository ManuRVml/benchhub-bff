<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-40-delete-comparison-profile.md · copied 2026-09-25 -->

# C-40 — Delete comparison profile

- Endpoint: `DELETE /api/v1/analyses/:analysisId/comparison-profiles/:profileId`
- Triggered from: SCR-06 "Análisis" → profile delete button (synthesis P4-22 row)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "deleted": true,
  "profileId": "branded-id"
}
```
- Permission required: `analyst_creator` role; profile ownership or analysis ownership
- Validation / errors:
  - PROFILE_NOT_FOUND: profileId does not exist or user lacks access
  - DEFAULT_PROFILE: cannot delete the default profile
  - FORBIDDEN: user cannot delete this profile
- Side effects: Removes comparison profile record; updates analysis defaults if needed
- budgetBytes: 1024
- Notes: Feature F17
