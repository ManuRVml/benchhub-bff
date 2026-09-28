<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-34-submit-assistant-feedback.md · copied 2026-09-25 -->

# C-34 — Submit assistant feedback

- Endpoint: `POST /api/v1/assistant/feedback`
- Triggered from: SCR-14 "Presentación · detalle" → thumbs up/down on assistant response (HTML L2100–2595)
- Request (minimal JSON):
```json
{
  "messageId": "branded-id",
  "rating": "up|down"
}
```
- Response:
```json
{
  "feedbackId": "branded-id",
  "ratedAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: `analyst_creator` role; any authenticated user with assistant access
- Validation / errors:
  - MESSAGE_NOT_FOUND: messageId does not exist
  - INVALID_RATING: rating must be up or down
  - FORBIDDEN: user cannot rate this message
- Side effects: Records user feedback on assistant message; used for model improvement
- budgetBytes: 1024
- Notes: Feature F04
