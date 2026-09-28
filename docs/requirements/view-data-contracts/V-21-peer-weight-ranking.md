<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-21-peer-weight-ranking.md · copied 2026-09-25 -->

# V-21 — Peer weight ranking

- Endpoint: `GET /api/v1/views/peer-weight-ranking/:analysisId` — SCR-09 "Ranking por categoría".
- Screens: SCR-09 Panorama card, ranking rows with explanation text.
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `dimension` (query, `fin | op | trans`, default `fin`) — lives in the URL as `ranking`.
- Response (minimal JSON):

```json
{
  "dimension": "fin",
  "rows": [
    { "rank": 1, "companyId": "cmp_totalenergies", "name": "TotalEnergies", "initials": "TO", "colorKey": "totalenergies", "pct": 62, "isLeader": true, "isEcopetrol": false, "explanation": { "key": "ranking.explain.leader", "params": { "name": "TotalEnergies", "dimension": "fin", "pct": 62 } } },
    { "rank": 3, "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "initials": "EC", "colorKey": "ecopetrol", "pct": 45, "isLeader": false, "isEcopetrol": true, "explanation": { "key": "ranking.explain.ecopetrol", "params": { "rank": 3, "dimension": "fin", "pct": 45, "gapToLeaderPts": 17, "leaderName": "TotalEnergies", "leaderPct": 62, "gapToAvgPts": 2 } } },
    { "rank": 3, "companyId": "cmp_shell", "name": "Shell", "initials": "SH", "colorKey": "shell", "pct": 40, "isLeader": false, "isEcopetrol": false, "explanation": { "key": "ranking.explain.peer", "params": { "name": "Shell", "rank": 3, "dimension": "fin", "pct": 40, "gapToLeaderPts": 5, "leaderName": "Chevron", "leaderPct": 45 } } }
  ],
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `pct` (declared dimension weight), `name`.
  - Derived by the BFF: `rank`, `isLeader`, `initials`, `explanation.key` + `params` (rule texts of HTML L4690–4692; the
    Ecopetrol variant adds the gap to the sector average).
  - Front-only: bar width = `pct` %, row / avatar colours (leader `#FEF3C7`, Ecopetrol `#EAFBE4` / `#83E377`), es-CO text
    from i18n keys.
- Sections: none — bare payload; failure is the endpoint ApiError (CF-128).
- Permissions: none (read-only).
- budgetBytes: 3072
- Commands used: none.
