<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-09-results-header.md · copied 2026-09-25 -->

# V-09 — Results header

- Endpoint: `GET /api/v1/views/results-header/:analysisId` — frame of Resultados (title, analysis tab bar, horizon
  control, module registry, action permissions). Primary datum of SCR-08: if it fails the page shows a full-page error.
- Screens: SCR-08 frame (header title `Resultados · {title}`, analysis tab bar, horizon segmented control, action row,
  footer actions, module order / visibility per horizon); SCR-08 horizon states S-TBG / S-ILP / S-UNION.
- Params:
  - `analysisId` (path, branded `AnalysisId`) — from the route `/analisis/:analysisId/resultados`.
  - `horizon` (query, `tbg | ilp | union`, default `tbg`) — lives in the URL as `horizonte=tbg|ilp|tbg-ilp` (the front maps
    `tbg-ilp` ↔ `union`).
- Response (minimal JSON):

```json
{
  "analysis": {
    "id": "ana_desempeno_4t_2025",
    "title": "Desempeño comparativo — 4T 2025",
    "status": "in_review",
    "lifecycleState": "preparation",
    "periodLabel": { "year": 2025, "quarter": 4 }
  },
  "horizon": "tbg",
  "horizonOptions": [
    { "id": "tbg", "labelKey": "results.horizon.tbg" },
    { "id": "ilp", "labelKey": "results.horizon.ilp" },
    { "id": "union", "labelKey": "results.horizon.union" }
  ],
  "modules": [
    { "id": "actionRow", "order": 1, "isGated": false, "visibleInHorizons": ["tbg", "ilp", "union"] },
    { "id": "companyCoverage", "order": 2, "isGated": false, "visibleInHorizons": ["tbg", "ilp"] },
    { "id": "peerAverageComparison", "order": 3, "isGated": false, "visibleInHorizons": ["tbg", "ilp", "union"] },
    { "id": "companyComparison", "order": 4, "isGated": false, "visibleInHorizons": ["tbg", "ilp", "union"] },
    { "id": "tbgIndicatorComparator", "order": 5, "isGated": true, "visibleInHorizons": ["tbg", "ilp"] },
    { "id": "futureAspiration", "order": 6, "isGated": true, "visibleInHorizons": ["tbg", "ilp"] },
    { "id": "tbgHorizon", "order": 7, "isGated": false, "visibleInHorizons": ["tbg", "ilp", "union"] },
    { "id": "tbgDimensionWeights", "order": 8, "isGated": true, "visibleInHorizons": ["tbg", "ilp"] },
    { "id": "comparisonProfiles", "order": 9, "isGated": true, "visibleInHorizons": ["tbg", "ilp"] },
    { "id": "reportSummary", "order": 10, "isGated": false, "visibleInHorizons": ["tbg", "ilp"] },
    { "id": "footerActions", "order": 11, "isGated": false, "visibleInHorizons": ["tbg", "ilp"] }
  ],
  "companySet": [
    { "id": "cmp_chevron", "name": "Chevron", "colorKey": "chevron" },
    { "id": "cmp_shell", "name": "Shell", "colorKey": "shell" }
  ],
  "analysisTabs": [
    { "id": "configuration", "isEnabled": true },
    { "id": "results", "isEnabled": true },
    { "id": "presentation", "isEnabled": true, "presentationId": "prs_desempeno_4t_2025" }
  ],
  "permissions": {
    "canEditValues": true,
    "canEditWeights": true,
    "canRecalculate": true,
    "canCreatePresentation": true,
    "canExport": true,
    "canGenerateNarrative": true
  }
}
```

- Raw vs derived:
  - Raw: `analysis.title`, `analysis.periodLabel`, `companySet[].name`.
  - Derived by the BFF: `analysis.status` and `lifecycleState` (critic M-04), `modules[]` (ordered registry per analysis type
    — CF-03, OQ-02; gated modules omitted entirely when the PO disables them — PLAN D10), `visibleInHorizons` (S-UNION hides
    modules 2, 10, 11 — SCR-08 part A), `analysisTabs[].presentationId` (existing presentation of the analysis, else null),
    every `permissions` flag.
  - Front-only: horizon label text (i18n), header title composition.
- Sections: single payload (no `SectionResult`): it is the primary datum; every module below loads from its own view
  (V-10..V-19) and fails independently.
- Permissions: `canEditValues` (module-2/3/4/10 inputs), `canEditWeights` (module 7 editor, C-07), `canRecalculate`
  ("Actualizar", C-08), `canCreatePresentation` ("Crear presentación"), `canExport` ("Excel", C-14),
  `canGenerateNarrative` (AI pills, C-15). All false for non-analyst roles, which never reach SCR-08 (guard).
- budgetBytes: 4096
- Commands used: `C-06 PATCH /api/v1/analyses/:analysisId/value-overrides` (footer "Guardar"), `C-08 POST
  /api/v1/recalculations` → `202 {operationId}` + `O-01 GET /api/v1/operations/:operationId` / `O-02 …/events` (footer
  "Actualizar", M-06 progress state), `C-15 POST /api/v1/executive-narratives` (action-row pill, OVL-08).
