<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-41-preview-invitations.md · copied 2026-09-25 -->

# C-41 — Preview invitations

- Endpoint: `POST /api/v1/analyses/:analysisId/preview-invitations`
- Triggered from: SCR-09 "Visualización" header → "Habilitar vista previa" button (SCR-09-visualizacion.md L199-205, overlays.md OVL-16)
- Request (minimal JSON):
```json
{
  "reviewerIds": ["branded-user-id", "branded-user-id"]
}
```
- Response:
```json
{
  "invited": true,
  "invitationIds": ["branded-id", "branded-id"],
  "sentAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; analysis ownership
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - ANALYSIS_NOT_IN_PREPARATION: analysis must be in 'preparation' lifecycle state
  - INVALID_REVIEWER: at least one reviewerId is invalid or self-invite
  - FORBIDDEN: user cannot invite reviewers for this analysis
- Side effects: Creates preview invitations; sends notifications to reviewers; changes lifecycle state to 'preview'
- budgetBytes: 2048
- Notes: [proposed, critic M-04] Feature F31
