<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-15-tbg-indicator-comparator.md · copied 2026-09-25 -->

# V-15 — TBG indicator comparator

- Endpoint: `GET /api/v1/views/tbg-indicator-comparator/:analysisId` — SCR-08 module 5 "Comparador de Indicadores TBG".
- Gated: true — PQ-only module (CF-02, OQ-02, PLAN D10); when the PO disables it the BFF omits module `tbgIndicatorComparator`
  from V-09 and this endpoint returns `404` for the analysis.
- Screens: SCR-08 module 5 (selects, KPI tiles, "Ranking TBG", "Pertenencia al TBG", "Análisis de brecha").
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp`, default `tbg`) — from the URL `horizonte`; hidden in `union`.
  - `indicatorId` (query, `IndicatorId`, default `ind_roace`) — not in the URL (module-local state) [inference].
  - `companyScope` (query, `all`, default `all`) — not in the URL; other values unknown (SCR-08 G1).
- Response (minimal JSON):

```json
{
  "indicator": { "id": "ind_roace", "label": "ROACE", "unit": "percent", "lowerIsBetter": false },
  "indicatorOptions": [ { "id": "ind_roace", "label": "ROACE" } ],
  "scopeOptions": [ { "id": "all", "labelKey": "comparator.scope.all" } ],
  "tiles": { "ecopetrolValue": 12.8, "tbgAvg": 19.8, "gapPts": -7, "rank": 7, "of": 9 },
  "ranking": [
    { "companyId": "cmp_shell", "name": "Shell", "value": 24.1, "isTbgMember": true, "isEcopetrol": false },
    { "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "value": 12.8, "isTbgMember": false, "isEcopetrol": true }
  ],
  "membership": {
    "inside": ["cmp_shell", "cmp_exxonmobil", "cmp_totalenergies", "cmp_bp"],
    "outside": ["cmp_ecopetrol", "cmp_chevron", "cmp_equinor", "cmp_petrobras", "cmp_isa"]
  },
  "gapToLeaderPts": -9.3,
  "permissions": { "canEditValues": true, "canGenerateNarrative": true }
}
```

- Raw vs derived:
  - Raw: `ranking[].value` (per-company indicator value; Ecopetrol override applied), `indicator.label`, `unit`,
    `lowerIsBetter`.
  - Derived by the BFF: `tiles.tbgAvg` (mean of TBG members), `gapPts` (Ecopetrol − TBG average), `rank` / `of`, ranking
    order, `isTbgMember` and `membership` (membership rule is BFF-configurable — SCR-08 G1), `gapToLeaderPts`.
  - Mock values follow the capture (Ecopetrol 12,8 — a different ROACE definition from the 7,4 of V-11/V-13, flagged
    CF-62); only the Ecopetrol value is legible, the other bar values are fixture-defined [inference].
  - Front-only: bar colours (`#16DB93` member, `#B3B9C4` other, `#83E377` Ecopetrol — CF-11), es-CO formatting.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-121).
- Permissions: `canEditValues` (Ecopetrol value input), `canGenerateNarrative` ("Generar narrativa ejecutiva", CF-12).
- budgetBytes: 4096
- Commands used: `C-06 PATCH /api/v1/analyses/:analysisId/value-overrides` (Ecopetrol value), `C-15 POST
  /api/v1/executive-narratives` (`section: tbgComparator`).
