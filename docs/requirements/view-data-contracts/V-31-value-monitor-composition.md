<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-31-value-monitor-composition.md · copied 2026-09-25 -->

# V-31 — Value monitor composition

- Endpoint: `GET /api/v1/views/value-monitor-composition` — SCR-11 "Composición del Monitor por categoría".
- Screens: SCR-11 section 9 (donut with centre "Cumplimiento" + category table "Categoría | # KVIs | % Peso |
  Cumplimiento").
- Params:
  - `snapshot` (query, `SnapshotId`, default latest) — URL `corte`.
- Response (minimal JSON):

```json
{
  "centerPct": 96.15,
  "categories": [
    { "id": "financiero", "label": "Financiero", "colorKey": "chart.category.financiero", "weightPct": 60, "kviCount": 9, "compliancePct": 94.69 },
    { "id": "mercado", "label": "Mercado", "colorKey": "chart.category.mercado", "weightPct": 15, "kviCount": 4, "compliancePct": 98.91 },
    { "id": "estrategico", "label": "Estratégico", "colorKey": "chart.category.estrategico", "weightPct": 20, "kviCount": 8, "compliancePct": 97.51 },
    { "id": "grupos_interes", "label": "Grupos de Interés", "colorKey": "chart.category.gruposInteres", "weightPct": 5, "kviCount": 1, "compliancePct": 100 }
  ],
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: category `label`, `weightPct` (category targets 60 / 15 / 20 / 5, `CAT_TARGETS` L4103).
  - Derived by the BFF (engine): `centerPct` = the global compliance (same value as V-27 `kpis.globalPct`, oracle 96.15)
    and `compliancePct` per category (oracle `expected.categories`: 94.69 / 98.91 / 97.51 / 100); `kviCount` counts TBD rows
    too; `colorKey`.
  - SCR-11 A4 decision [inference, PO to confirm]: V2's centre is a simple mean of capped results × snapshot factor (96.1)
    and its category column is 90 / 97 / 100 / 100; the product returns one engine value per concept, so the centre shows
    `96,2 %` (one decimal) and the column shows the engine category compliance.
  - Front-only: donut geometry (segments by `weightPct`, start at 12 o'clock), es-CO formatting, band colour of the
    compliance column.
- Sections: single `SectionResult` for the card.
- Permissions: none (read-only; empty `permissions` object).
- budgetBytes: 1536
- Commands used: none (refreshed from the `C-16` response).
