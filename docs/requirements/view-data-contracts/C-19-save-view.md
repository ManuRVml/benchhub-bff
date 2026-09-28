<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-19-save-view.md · copied 2026-09-25 -->

# C-19 — Save view

- Endpoint: `POST /api/v1/saved-views`
- Triggered from: SCR-05 "Inicio" / SCR-08 "Resultados" / SCR-11 "Monitor" → "Guardar vista" button (HTML L246–381, L720–1078, L1685–2098)
- Request (minimal JSON):
```json
{
  "screen": "inicio|analisis|definicion|resultados|visualizacion|detalle-indicador|monitor-valor|sensibilidades|presentaciones|presentacion-detalle|notificaciones|configuracion",
  "state": {
    "filters": {},
    "columns": [],
    "sort": {}
  }
}
```
- Response:
```json
{
  "id": "branded-id",
  "createdAt": "2025-10-03T10:00:00Z"
}
```
- Permission required: Any authenticated user (saved views are per user)
- Validation / errors:
  - INVALID_SCREEN: screen must be one of the allowed types
  - STATE_REQUIRED: state field is required
  - FORBIDDEN: user cannot save view for this screen
- Side effects: Creates saved view record; stores user-specific view configuration
- budgetBytes: 4096
- Notes: Feature F36
