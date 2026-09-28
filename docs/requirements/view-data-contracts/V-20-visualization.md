<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-20-visualization.md · copied 2026-09-25 -->

# V-20 — Visualization dashboard

- Endpoint: `GET /api/v1/views/visualization/:analysisId` — SCR-09 "Visualización · Dashboard" (everything except the
  ranking list, the indicator panel, the recommendations modal and the comments rail, which load from V-21, V-22, V-23,
  V-26).
- Screens: SCR-09 header card (position + lifecycle), Panorama KPI tiles, heatmap, radar, "Categorías" cards, "Composición
  de peso por línea de indicador"; lifecycle banner [proposed, critic M-04].
- Params:
  - `analysisId` (path, `AnalysisId`) — from `/analisis/:analysisId/visualizacion`.
  - URL params `categoria`, `ranking`, `peso` of the route are consumed by V-22 / V-21 and by the front (active
    composition tab); this view takes none.
- Response (minimal JSON):

```json
{
    "lifecycleState": "preview",
  "position": { "tierId": 2, "periodLabel": { "year": 2025, "quarter": 4 }, "indicatorCount": 10, "peerCount": 6 },
  "kpiTiles": {
    "status": "ok",
    "data": [
      { "dimension": "fin", "sectorAvg": 43, "ecopetrol": 45, "min": 33, "max": 62 },
      { "dimension": "op", "sectorAvg": 30, "ecopetrol": 30, "min": 15, "max": 40 },
      { "dimension": "trans", "sectorAvg": 28, "ecopetrol": 25, "min": 24, "max": 33 }
    ]
  },
  "heatmap": {
    "status": "ok",
    "data": [
      { "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "isEcopetrol": true, "fin": 45, "op": 30, "trans": 25 },
      { "companyId": "cmp_bp", "name": "BP", "isEcopetrol": false, "fin": 55, "op": 15, "trans": 30 }
    ]
  },
  "radar": {
    "status": "ok",
    "data": { "axes": ["fin", "op", "trans"], "ecopetrol": [45, 30, 25], "sector": [43, 30, 28] }
  },
  "categories": {
    "status": "ok",
    "data": [
      { "id": "rentabilidad", "label": "Rentabilidad", "tierId": 2, "message": "Ecopetrol mantiene margen sólido pese a la contracción." },
      { "id": "solvencia", "label": "Solvencia", "tierId": 4, "message": "Mayor reto por niveles de apalancamiento." }
    ]
  },
  "weightComposition": {
    "status": "ok",
    "data": {
      "ecopetrol": { "fin": 45, "op": 30, "trans": 25 },
      "diffs": { "fin": 2, "op": 0, "trans": -3 },
      "companies": [
        { "companyId": "cmp_totalenergies", "name": "TotalEnergies", "fin": 62, "op": 20, "trans": 24, "totalPct": 106, "sumStatus": "over" },
        { "companyId": "cmp_bp", "name": "BP", "fin": 55, "op": 15, "trans": 30, "totalPct": 100, "sumStatus": "ok" }
      ],
      "groupAvg": { "fin": 43, "op": 30, "trans": 28 },
      "hasOverweight": true,
      "lineLegend": [
        { "code": "LIN-01", "dimension": "fin", "formula": "Promedio ponderado de ROACE, Margen EBITDA y Deuda Neta/EBITDA" },
        { "code": "LIN-02", "dimension": "op", "formula": "Promedio ponderado de crecimiento de producción y competitividad en OPEX" },
        { "code": "LIN-03", "dimension": "trans", "formula": "Promedio ponderado de gobernanza corporativa y factores ESG" }
      ]
    }
  },
  "permissions": {
    "canPublish": true,
    "canEnablePreview": true,
    "canCreatePresentation": true,
    "canComment": true
  }
}
```

- Raw vs derived:
  - Raw: peer and Ecopetrol dimension weights (`heatmap[].fin/op/trans`, `ecopetrol`, `companies[].fin/op/trans` — V2
    `pesosCompania` + `ECOPETROL_PESO`; they differ from V-17's `QUAL_DATA`, CF-65, OQ-08), category `label` / `message`,
    `lineLegend[].formula`.
  - Derived by the BFF: `lifecycleState` (`preparation | preview | published`, critic M-04 [proposed]),
    `position.tierId` (round of the mean of category tiers — 2 in the mock), `indicatorCount` / `peerCount` (computed,
    replacing V2's static "34 … 14" — CF-73), `kpiTiles.*` (sector mean, min, max), `radar.sector`, `categories[].tierId`,
    `diffs` (signed pts), `totalPct`, `sumStatus`, `groupAvg`, `hasOverweight`.
  - Front-only: tier names / colours from `tierId`, heatmap cell colour `mix(#F5F6F7, dimColor, v/100)`, period display
    "T4 2025" (CF-76), segment tips text, sorting of composition rows by the active `peso` tab.
- Sections: none — bare payload; failure is the endpoint ApiError (CF-128).
- Permissions: `canPublish` ("Publicar", analyst, CF-36), `canEnablePreview` ("Habilitar vista previa" → OVL-16
  [proposed]), `canCreatePresentation`, `canComment` (rail composer; thread flags come from V-26).
- budgetBytes: 12288
- Commands used: `C-09 POST /api/v1/publications` (`{analysisId, products:["report"]}` → OVL-10), `C-41 POST
  /api/v1/analyses/:analysisId/preview-invitations` (`{reviewerIds[]}` [proposed, critic M-04]; OVL-16 lists invitable
  users — source open, OQ-39), `C-10 POST /api/v1/review-comments`, `C-11 PATCH /api/v1/review-comments/:commentId`
  [proposed UI, M-05], `C-12 POST /api/v1/change-requests`, `C-13 PATCH /api/v1/change-requests/:requestId` [proposed
  UI, M-05] (comments rail, thread read from V-26).
