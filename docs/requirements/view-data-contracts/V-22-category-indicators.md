<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-22-category-indicators.md · copied 2026-09-25 -->

# V-22 — Category indicators

- Endpoint: `GET /api/v1/views/category-indicators/:analysisId` — SCR-09 indicator panel under "Categorías".
- Screens: SCR-09 indicator panel (header label + message, rows Ecopetrol / Prom. pares / tier, "›" to SCR-10).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `category` (query, `CategoryId`, default `rentabilidad`) — lives in the URL as `categoria`.
- Response (minimal JSON):

```json
{
  "category": { "id": "rentabilidad", "label": "Rentabilidad", "message": "Ecopetrol mantiene margen sólido pese a la contracción." },
  "rows": [
    { "indicatorId": "ind_roace", "code": "IND-ROACE", "label": "ROACE (%)", "unit": "percent", "valueKind": "level", "ecopetrol": 7.4, "peerAvg": 5.5, "tierId": 2, "hasDetail": true },
    { "indicatorId": "ind_crec_ebitda", "code": "IND-CREC-EBITDA", "label": "Crecimiento EBITDA (%)", "unit": "percent", "valueKind": "growth", "ecopetrol": -13.8, "peerAvg": -2.2, "tierId": 4, "hasDetail": false }
  ],
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `label`, `unit`, `ecopetrol` (published value, `number | null`; CF-37, CF-131), `category.label` / `message`.
  - Derived by the BFF: `code` (display code), `peerAvg` (`number | null`; CF-131), `tierId` (engine), `hasDetail`, `valueKind` (`level | growth`
    — lets the front show a `+` sign only on growth values; V2 prefixes every positive percentage, SCR-09 A7).
  - Front-only: tier chip colours / names, `null` renders "—" (es-CO formatting, P5-06).
- Sections: none — bare payload; failure is the endpoint ApiError (CF-128).
- Permissions: none (read-only for every role, BACKEND rule 4).
- budgetBytes: 3072
- Commands used: none (row click navigates to SCR-10, V-24).
