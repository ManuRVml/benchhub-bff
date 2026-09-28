<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-18-add-indicator-to-monitor.md · copied 2026-09-25 -->

# C-18 — Add indicator to value monitor

- Endpoint: `POST /api/v1/value-monitor-kvis`
- Triggered from: SCR-11 "Monitor de Valor" → "Añadir al monitor" button (HTML L1685–2098)
- Request (minimal JSON):
```json
{
  "source": "categories|all|custom",
  "indicatorIds": ["branded-id", "branded-id"]
}
```
- Response:
```json
{
  "added": true,
  "monitorCount": 15
}
```
- Permission required: `analyst_creator` role; monitor configuration ownership
- Validation / errors:
  - INVALID_SOURCE: source must be one of categories, all, or custom
  - INDICATOR_NOT_FOUND: one or more indicatorIds do not exist
  - FORBIDDEN: user cannot configure this monitor
- Side effects: Adds indicators to value monitor configuration; updates monitor display
- budgetBytes: 2048
- Notes: Feature F25
