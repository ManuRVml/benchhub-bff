<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-16-update-kvi-targets.md · copied 2026-09-25 -->

# C-16 — Update KVI targets

- Endpoint: `PATCH /api/v1/kvis/:kviId/targets`
- Triggered from: SCR-11 "Monitor de Valor" → KVI target editor (HTML L1685–2098)
- Request (minimal JSON):
```json
{
  "meta": 7.19,
  "metaReto": 10.53
}
```
- Response:
```json
{
  "kviId": "kvi_fcl",
  "targets": {
    "meta": 7.19,
    "metaReto": 10.53
  },
  "row": {
    "kviId": "kvi_fcl", "code": "KVI-FCL", "category": "financiero", "categoryLabel": "Financiero",
    "label": "Flujo de Caja Libre", "unit": "bcop", "weightPct": 10, "owner": "Diego Gómez",
    "meta": 7.19, "metaReto": 10.53, "real": 10.69,
    "resultPct": 149, "retoPct": 102, "resultBand": "ok", "retoBand": "ok",
    "isTbd": false, "isTextMode": false, "lowerIsBetter": false, "isEditable": true
  },
  "kpis": {
    "globalPct": 96.15, "retoPct": 78.56, "atRiskCount": 1, "tbdCount": 3
  },
  "composition": {
    "centerPct": 96.15,
    "categories": [
      { "id": "financiero", "label": "Financiero", "colorKey": "chart.category.financiero", "weightPct": 60, "kviCount": 9, "compliancePct": 94.69 },
      { "id": "mercado", "label": "Mercado", "colorKey": "chart.category.mercado", "weightPct": 15, "kviCount": 4, "compliancePct": 98.91 },
      { "id": "estrategico", "label": "Estratégico", "colorKey": "chart.category.estrategico", "weightPct": 20, "kviCount": 8, "compliancePct": 97.51 },
      { "id": "grupos_interes", "label": "Grupos de Interés", "colorKey": "chart.category.gruposInteres", "weightPct": 5, "kviCount": 1, "compliancePct": 100 }
    ]
  }
}
```
- `row = V-30 rows[] item, kpis = V-27 kpis.data, composition = V-31 data (CF-103); the web replaces these three in its caches after a successful PATCH`.
- Permission required: `analyst_creator` role; KVI ownership or collaborative editing permission
- Validation / errors:
  - KVI_NOT_FOUND: kviId does not exist or user lacks access
  - INVALID_TARGET: meta target must be valid numeric value
  - FORBIDDEN: user cannot update this KVI
- Side effects: Updates KVI target values; recomputes affected row; recalculates group aggregates
- budgetBytes: 4096
- Notes: Feature F24
