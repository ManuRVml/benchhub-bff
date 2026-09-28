<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-16-future-aspiration.md · copied 2026-09-25 -->

# V-16 — Future aspiration 2040+

- Endpoint: `GET /api/v1/views/future-aspiration/:analysisId` — SCR-08 module 6 "Aspiración futura 2040+".
- Gated: true — PQ-only module (CF-02, OQ-02, PLAN D10); omitted from V-09 when the PO disables it.
- Screens: SCR-08 module 6 (tiles, segment chips, ranked stacked bars, footnote).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `segment` (query, `total | crude | gas | unconventional | lowEmissions`, default `total`) — not in the URL
    (module-local chip state) [inference].
- Response (minimal JSON):

```json
{
  "tiles": {
    "ecopetrolProductionKbped": 855,
    "totalRank": 9,
    "of": 10,
    "lowEmissionsSharePct": { "ecopetrol": 11, "peers": 9 }
  },
  "segments": [
    { "id": "crude", "labelKey": "aspiration.segment.crude", "colorKey": "aspiration.crude" },
    { "id": "gas", "labelKey": "aspiration.segment.gas", "colorKey": "aspiration.gas" },
    { "id": "unconventional", "labelKey": "aspiration.segment.unconventional", "colorKey": "aspiration.unconventional" },
    { "id": "lowEmissions", "labelKey": "aspiration.segment.lowEmissions", "colorKey": "aspiration.lowEmissions" }
  ],
  "segment": "total",
  "rows": [
    { "rank": 1, "companyId": "cmp_exxon", "name": "Exxon", "isEcopetrol": false, "segments": { "crude": 2400, "gas": 1300, "unconventional": 800, "lowEmissions": 250 }, "total": 4750 },
    { "rank": 9, "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "isEcopetrol": true, "segments": { "crude": 450, "gas": 220, "unconventional": 90, "lowEmissions": 95 }, "total": 855 }
  ],
  "footnoteKey": "aspiration.footnote",
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: per-company `segments.*` (kbpe/d; splits are not legible in the capture and are fixture-defined so they sum to
    the capture totals — SCR-08 G2), `name`.
  - Derived by the BFF: `total` (sum of segments), `rank` (for the selected segment), `tiles.*` (Ecopetrol total, rank,
    low-emission share vs peer average).
  - Totals follow `docs/design/mock-data-catalog.md` ASPIRATION_2040 (Exxon 4.750 … Ecopetrol 855, YPF 750).
  - Front-only: segment colours, es-CO thousands (`4.750`), highlighted Ecopetrol row.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-121).
- Permissions: none (read-only).
- budgetBytes: 4096
- Commands used: none.
