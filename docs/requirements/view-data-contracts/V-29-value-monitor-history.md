<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-29-value-monitor-history.md · copied 2026-09-25 -->

# V-29 — Value monitor history

- Endpoint: `GET /api/v1/views/value-monitor-history` — SCR-11 "Comparación con serie histórica".
- Screens: SCR-11 section 5 (range chips "Actual" / "5 años" / "8 años" / "10 años" + vertical bars).
- Params:
  - `indicator` (query, `IndicatorId`, default `ind_roace`).
  - `range` (query, `actual | 5y | 8y | 10y`, default `actual`) — URL `historico`.
  - `snapshot` (query, `SnapshotId`, default latest) — URL `corte`.
- Response (minimal JSON):

```json
{
  "indicator": { "id": "ind_roace", "label": "ROACE", "unit": "percent" },
  "range": "actual",
  "points": [
    { "year": 2024, "value": 10.2 },
    { "year": 2025, "value": 7.4 }
  ],
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `points[].value` (Ecopetrol's real series per year; V2 values are synthetic and index-based — SCR-11 A7, not
    reproduced).
  - Derived by the BFF: year window per `range` (Actual 2024–2025, 5y 2021–2025, 8y 2018–2025, 10y 2016–2025), missing years
    omitted (no zero-fill).
  - Front-only: bar height from the series max [inference: V2 fixes 12 % = full height], value labels es-CO one decimal.
- Sections: single `SectionResult` for the card; an empty `points` array renders the empty-state line.
- Permissions: none (read-only; empty `permissions` object).
- budgetBytes: 1536
- Commands used: none.
