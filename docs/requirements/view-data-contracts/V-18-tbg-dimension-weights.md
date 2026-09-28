<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-18-tbg-dimension-weights.md · copied 2026-09-25 -->

# V-18 — TBG dimension weights

- Endpoint: `GET /api/v1/views/tbg-dimension-weights/:analysisId` — SCR-08 module 8 "Peso en TBG por dimensión · GE vs.
  pares".
- Gated: true — PQ-only module (CF-02, OQ-02, PLAN D10; synthesis §4.2 marks V-18 `[gated]`); omitted from V-09 when the
  PO disables it.
- Screens: SCR-08 module 8 (dimension tabs, Ecopetrol vs peer-average bars, message, "Detalle por compañía · {dimensión}"
  ranking); OVL-01 via V-23.
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp`, default `tbg`) — from the URL `horizonte`; hidden in `union`.
  - `dimension` (query, `fin | op | trans`, default `fin`) — module-local tab, not in the URL [inference].
- Response (minimal JSON):

```json
{
  "dimension": "fin",
  "ecopetrolPct": 45,
  "peerAvgPct": 43,
  "diffPts": 2,
  "message": { "key": "tbgWeights.message.above", "params": { "diffPts": 2, "dimension": "fin" } },
  "detail": [
    { "rank": 1, "companyId": "cmp_totalenergies", "name": "TotalEnergies", "pct": 62 },
    { "rank": 2, "companyId": "cmp_bp", "name": "BP", "pct": 55 },
    { "rank": 6, "companyId": "cmp_petrobras", "name": "Petrobras", "pct": 33 }
  ],
  "recommendationsCount": 0,
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `ecopetrolPct` (Ecopetrol's declared weight; 45 in V2 / capture vs 40 in slides D1 / D2 — SCR-08 G3, OQ-08),
    `detail[].pct` (peer declared weights, V2 `pesosCompania`).
  - Derived by the BFF: `peerAvgPct` (mean of peers, integer — 43 for Financiera), `diffPts` (signed), `message.key`
    (`above | below | equal`), `detail[].rank`, `recommendationsCount` (actionable items of V-23).
  - Front-only: bar colours (Ecopetrol `#83E377` — CF-11; average `#672DBD`), message copy from i18n.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-121).
- Permissions: none (read-only).
- budgetBytes: 2048
- Commands used: none (OVL-01 reads `V-23 GET /api/v1/views/weight-recommendations/:analysisId?scope=visualization`).
