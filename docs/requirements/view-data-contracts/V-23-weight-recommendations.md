<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-23-weight-recommendations.md · copied 2026-09-25 -->

# V-23 — Weight recommendations

- Endpoint: `GET /api/v1/views/weight-recommendations/:analysisId` — OVL-01 "✦ Recomendaciones de Yarbis" and the count
  shown in its pill.
- Screens: SCR-09 Panorama pill + OVL-01; SCR-08 module 7 pill (`scope=horizon`) and module 8 pill (`scope=visualization`).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `scope` (query, `visualization | horizon`, default `visualization`) — fixed per trigger, not in the URL.
  - `horizon` (query, `tbg | ilp`, default `tbg`) — only for `scope=horizon`; from the SCR-08 URL `horizonte`.
- Response example (minimal JSON):

```json
{
  "scope": "visualization",
  "items": [
    { "dimension": "fin", "tone": "ok", "text": { "key": "reco.weights.ok", "params": { "dimension": "fin", "ecopetrolPct": 45, "peerAvgPct": 43 } } },
    { "dimension": "trans", "tone": "ok", "text": { "key": "reco.weights.ok", "params": { "dimension": "trans", "ecopetrolPct": 25, "peerAvgPct": 28 } } }
  ],
  "countActionable": 0,
  "status": "suggestion",
  "permissions": {}
}
```

    `scope=horizon` returns the three module-7 cards (`label` "Indicador más concentrado", "Consistencia de datos",
    "Dimensión Financiera"; HTML L4482–4486) with `tone: info | watch | action` and the same `text` shape.

- Response (scope=horizon, CF-130):
```json
{
  "scope": "horizon",
  "items": [
    { "kind": "most_concentrated", "tone": "info", "text": { "key": "reco.horizon.mostConcentrated", "params": { "company": "Ecopetrol", "indicator": "ROACE", "pct": 45 } } },
    { "kind": "data_consistency", "tone": "watch", "text": { "key": "reco.horizon.dataConsistency", "params": { "company": "Ecopetrol", "companyTotal": 96 } } },
    { "kind": "dominant_dimension", "tone": "action", "text": { "key": "reco.horizon.dominantDimension", "params": { "dimension": "Financiero", "finPct": 45, "opPct": 30, "transPct": 25 } } }
  ],
  "countActionable": 1,
  "status": "suggestion",
  "permissions": {}
}
```
- Raw vs derived:
  - Derived by the BFF (rule-based suggestion): `tone` (`|diff| < 6` → `ok`, `diff > 0` → `watch`, `diff < 0` →
    `action`, HTML L4703–4705), `text.key` + `params` (leader name / pct for `action`), `countActionable` (items whose tone
    is not `ok` — 0 in the mock, pill shows "(0)"), `status` (`suggestion`).
  - Front-only: card background / label colour per tone, es-CO text from i18n.
- Sections: none — bare payload; failure is the endpoint ApiError (CF-128).
- Permissions: none (read-only; published AI text visible to every role that sees the screen, CF-40).
- budgetBytes: 2048
- Commands used: none.
