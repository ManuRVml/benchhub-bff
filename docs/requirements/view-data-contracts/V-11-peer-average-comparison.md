<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-11-peer-average-comparison.md · copied 2026-09-25 -->

# V-11 — Peer average comparison

- Endpoint: `GET /api/v1/views/peer-average-comparison/:analysisId` — SCR-08 module 3 "Comparativo GE vs. Promedio Pares".
- Screens: SCR-08 module 3 (category chips, paired GE / Pares bars with editable values, "Ver más ›").
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp | union`, default `tbg`) — from the URL `horizonte`.
  - `category` (query, `CategoryId`, default `rentabilidad`) — lives in the URL as `categoria`.
- Response (minimal JSON):

```json
{
  "categories": [
    { "id": "rentabilidad", "label": "Rentabilidad" },
    { "id": "liquidez", "label": "Liquidez" }
  ],
  "category": "rentabilidad",
  "rows": [
    { "indicatorId": "ind_roace", "label": "ROACE (%)", "unit": "percent", "geValue": 7.4, "peerAvg": 5.5, "hasDetail": true },
    { "indicatorId": "ind_crec_ebitda", "label": "Crecimiento EBITDA (%)", "unit": "percent", "geValue": -13.8, "peerAvg": -2.2, "hasDetail": false }
  ],
  "peerAvgCompanies": ["cmp_chevron", "cmp_shell", "cmp_equinor", "cmp_bp", "cmp_isa"],
  "permissions": { "canEditValues": true }
}
```

- Raw vs derived:
  - Raw: `label`, `unit`, `geValue` (Grupo Ecopetrol value, override applied).
  - Derived by the BFF: `peerAvg` (mean of the peer set listed in `peerAvgCompanies`, override applied), `hasDetail`
    (indicator has a peer series for SCR-10).
  - Front-only: bar widths `|v| / (max(|GE|, |Pares|, 0.01) × 1.15)` (HTML L4771–4772), signed values and es-CO
    formatting (CF-70, CF-72 negatives keep positive length).
- Sections: none — the whole payload is one module; failure is the endpoint ApiError (CF-97).
- Permissions: `canEditValues` (number inputs).
- budgetBytes: 4096
- Commands used: `C-06 PATCH /api/v1/analyses/:analysisId/value-overrides` (`{indicatorId, geValue? | peerAvg?}`, autosave
  debounce 500 ms — SCR-08 B5), `C-15 POST /api/v1/executive-narratives` (`section: comp`, "Narrativa" pill).
