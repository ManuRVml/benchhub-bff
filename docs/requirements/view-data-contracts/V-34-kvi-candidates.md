<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-34-kvi-candidates.md · copied 2026-09-25 -->

# V-34 — KVI candidates

- Endpoint: `GET /api/v1/views/kvi-candidates` — OVL-05 "Añadir indicador".
- Screens: OVL-05 (source tabs "Referenciamiento de pares" / "TBG" / "ILP", checkbox list, "{n} seleccionados", "Añadir al
  monitor").
- Params:
  - `source` (query, `pares | tbg | ilp`, default `pares`) — the active tab; selection is kept client-side across tabs.
- Response (minimal JSON):

```json
{
  "source": "tbg",
  "items": [
    { "indicatorId": "ind_tbg_flujo_caja_libre", "label": "Flujo de Caja Libre", "categoryLabel": "Financiero", "isAlreadyIncluded": true },
    { "indicatorId": "ind_tbg_deuda_bruta_ebitda", "label": "Deuda Bruta / EBITDA", "categoryLabel": "Financiero", "isAlreadyIncluded": true },
    { "indicatorId": "ind_tbg_dividendos_recibidos", "label": "Dividendos Recibidos", "categoryLabel": "Estratégico", "isAlreadyIncluded": true }
  ],
  "permissions": { "canConfigure": true }
}
```

- Raw vs derived:
  - Raw: `label`, `categoryLabel` per source catalogue (V2 lists 5 pares, 3 TBG, 3 ILP items, HTML L4988–5004).
  - Derived by the BFF: `isAlreadyIncluded` (candidate maps to a KVI already in the monitor; the UI disables it — SCR-11
    A10 [inference]); stable `indicatorId`s (CF-77).
  - Front-only: selected count ("{n} seleccionados").
- Sections: single `SectionResult` per tab load (CF-135).
- Permissions: `canConfigure` (the overlay is reachable only from the configuration card).
- budgetBytes: 2048
- Commands used: `C-18 POST /api/v1/value-monitor-kvis` (`{source, indicatorIds[]}`, "Añadir al monitor"; then V-30 / V-32
  reload).
