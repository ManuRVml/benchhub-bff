<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-03-generate-analysis.md · copied 2026-09-25 -->

# C-03 — Generate analysis

- Endpoint: `POST /api/v1/analysis-drafts/:draftId/generation`
- Triggered from: SCR-07 "Definición del análisis" → "Generar análisis" button (HTML L718)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "operationId": "branded-id",
  "status": "accepted"
}
```
- Permission required: `analyst_creator` role; draft ownership
- Validation / errors:
  - DRAFT_NOT_FOUND: draftId does not exist or user lacks access
  - DRAFT_NOT_COMPLETE: required fields missing (step 5 not completed)
  - FORBIDDEN: user cannot generate this draft
  - ALREADY_GENERATED: draft already has a generated analysis
- Side effects: Initiates ingest job (data collection) and calculate job (metrics computation); creates analysis record from draft; sets lifecycleState to "in_progress"
- budgetBytes: 1024
- Notes: Long-running operation returns 202 with operationId; client polls status via V-XX endpoint
