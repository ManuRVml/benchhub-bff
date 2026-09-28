<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-13-report-summary.md · copied 2026-09-25 -->

# V-13 — Report summary

- Endpoint: `GET /api/v1/views/report-summary/:analysisId` — SCR-08 module 10 "Resumen del informe".
- Screens: SCR-08 module 10 (category multi-select chips, table Categoría / KPIs / Valor GE / Promedio pares, "Excel").
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp`, default `tbg`) — from the URL `horizonte`; module hidden in `union`.
  - `categories` (query, comma-separated `CategoryId[]`, default all) — lives in the URL as `resumen`.
- Response (minimal JSON):

```json
{
  "categoryOptions": [
    { "id": "rentabilidad", "label": "Rentabilidad" },
    { "id": "solvencia", "label": "Solvencia" }
  ],
  "rows": [
    { "category": { "id": "rentabilidad", "label": "Rentabilidad", "tier": 2 }, "indicatorId": "ind_roace", "label": "ROACE (%)", "unit": "percent", "geValue": 7.4, "peerAvg": 5.5 },
    { "category": { "id": "solvencia", "label": "Solvencia", "tier": 4 }, "indicatorId": "ind_deuda_ebitda", "label": "Deuda Neta/EBITDA (x)", "unit": "ratio_x", "geValue": 2.4, "peerAvg": 1.6 }
  ],
  "permissions": { "canEditValues": true, "canExport": true }
}
```

- Raw vs derived:
  - Raw: `label`, `unit`, `geValue` (override applied).
  - Derived by the BFF: `category.tier` (1–4, engine), `peerAvg` (mean of the peer set, override applied), row order
    (catalog order).
  - Front-only: tier dot colour from `tier`, es-CO number formatting in inputs.
- Sections: none — the whole payload is one module; failure is the endpoint ApiError (CF-97).
- Permissions: `canEditValues` (inputs + autosave toast), `canExport` ("Excel").
- budgetBytes: 6144
- Commands used: `C-06 PATCH /api/v1/analyses/:analysisId/value-overrides` (autosave, debounce 500 ms; clearing an input
  sends `value: null` to remove the override), `C-14 POST /api/v1/exports` (`{kind: report-summary-xlsx, params:
  {analysisId, categories}}` → `202 {operationId}`) + `O-01 GET /api/v1/operations/:operationId` + `O-03 GET
  /api/v1/files/:fileId/download`, `C-15 POST /api/v1/executive-narratives` (`section: resumen`).
