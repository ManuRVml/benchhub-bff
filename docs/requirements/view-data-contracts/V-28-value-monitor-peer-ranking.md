<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-28-value-monitor-peer-ranking.md · copied 2026-09-25 -->

# V-28 — Value monitor peer ranking

- Endpoint: `GET /api/v1/views/value-monitor-peer-ranking` — SCR-11 "Ranking de pares · ROACE".
- Screens: SCR-11 section 4 (top-6 horizontal bars; row click → OVL-13 company profile).
- Params:
  - `indicator` (query, `IndicatorId`, default `ind_roace`) — not in the URL (only ROACE in v1).
  - `snapshot` (query, `SnapshotId`, default latest) — from the URL `corte`.
- Response (minimal JSON):

```json
{
  "indicator": { "id": "ind_roace", "label": "ROACE", "unit": "percent" },
  "periodLabel": "2025",
  "rows": [
    { "rank": 1, "companyId": "cmp_ecopetrol", "displayName": "Ecopetrol", "value": 7.4, "isEcopetrol": true },
    { "rank": 2, "companyId": "cmp_conocophillips", "displayName": "ConocoPhillips", "value": 7.2, "isEcopetrol": false },
    { "rank": 6, "companyId": "cmp_totalenergies", "displayName": "TotalEnergies", "value": 6.1, "isEcopetrol": false }
  ],
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `value` per company (indicator value of the latest period — CF-69; V2 wrongly shows the 2024 column), `displayName`
    (company catalogue; V2 "Total" → "TotalEnergies").
  - Derived by the BFF: `rank`, ordering and the top-6 cut (Ecopetrol always included), `periodLabel`, `isEcopetrol`.
  - Front-only: bar width = value / max (min 6 %), Ecopetrol row tint `#E9FBF8`, es-CO one decimal (`7,4 %`).
- Sections: single `SectionResult` for the card (failure → `Cmp:SectionError` inside the card; the rest of the Monitor
  renders).
- Permissions: none (read-only; empty `permissions` object). Company profile access uses V-25.
- budgetBytes: 1536
- Commands used: none.
