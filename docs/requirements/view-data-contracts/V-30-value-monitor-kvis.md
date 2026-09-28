<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-30-value-monitor-kvis.md · copied 2026-09-25 -->

# V-30 — Value monitor KVIs

- Endpoint: `GET /api/v1/views/value-monitor-kvis` — SCR-11 "Monitor de Valor Grupo Ecopetrol · KVIs".
- Screens: SCR-11 section 8 (warning band, CATEGORÍA / CUMPLIMIENTO filters, 22-row KVI table with Meta 2025 / Meta Reto
  inputs); KVI name click → OVL-11 (V-33).
- Params:
  - `snapshot` (query, `SnapshotId`, default latest) — URL `corte`.
  - `categories` (query, comma list of `financiero | mercado | estrategico | grupos_interes`, default all) — URL `categoria`.
  - `compliance` (query, comma list of `ok | watch | risk | tbd`, default all; applied to `resultBand`) — URL `cumplimiento`.
  - Filters are ANDed across groups, ORed within a group; the front may also filter the loaded rows client-side (SCR-11
    Interactions) — the params exist so a deep link loads only the matching rows.
- Response (minimal JSON):

```json
{
  "warnings": [
    { "code": "results_2025_in_review", "text": "⚠ Resultados 2025 en revisión" },
    { "code": "targets_2026_in_construction", "text": "⚠ Metas y seguimiento resultados 2026 en construcción" }
  ],
  "rows": [
    {
      "kviId": "kvi_fcl", "code": "KVI-FCL", "category": "financiero", "categoryLabel": "Financiero",
      "label": "Flujo de Caja Libre", "unit": "bcop", "weightPct": 10, "owner": "Diego Gómez",
      "meta": 7.19, "metaReto": 10.53, "real": 10.69,
      "resultPct": 149, "retoPct": 102, "resultBand": "ok", "retoBand": "ok",
      "isTbd": false, "isTextMode": false, "lowerIsBetter": false, "isEditable": true
    },
    {
      "kviId": "kvi_roacewacc", "code": "KVI-ROACEWACC", "category": "financiero", "categoryLabel": "Financiero",
      "label": "ROACE menos WACC", "unit": "percent", "weightPct": null, "owner": "Liz Cardona",
      "meta": null, "metaReto": null, "real": null,
      "resultPct": null, "retoPct": null, "resultBand": "tbd", "retoBand": "tbd",
      "isTbd": true, "isTextMode": false, "lowerIsBetter": false, "isEditable": false
    },
    {
      "kviId": "kvi_riesgocred", "code": "KVI-RIESGOCRED", "category": "mercado", "categoryLabel": "Mercado",
      "label": "Calificación de Riesgo Crediticio", "unit": "rating", "weightPct": null, "owner": "GMV",
      "meta": null, "metaReto": null, "real": null, "metaText": "BB", "metaRetoText": "BB", "realText": "BB",
      "resultPct": 100, "retoPct": 100, "resultBand": "ok", "retoBand": "ok",
      "isTbd": false, "isTextMode": true, "lowerIsBetter": false, "isEditable": false
    }
  ],
  "permissions": { "canEditTargets": true }
}
```

- Raw vs derived:
  - Raw: `label`, `code`, `category`, `unit` (code: `percent | ratio_x | bcop | mmcop | musd | cop | cop_per_kwh | rating`),
    `weightPct` (V2 table value, `null` shown "—"), `owner`, `meta`, `metaReto`, `real` (**read-only**, CF-38), text-mode
    values (`metaText`, `metaRetoText`, `realText`).
  - Derived by the BFF: `resultPct` / `retoPct` = round(Real / Meta × 100), or Meta / Real when `lowerIsBetter`, floor 0,
    **not capped** (HTML L4184–4188); `resultBand` / `retoBand` (≥ 90 `ok`, 70–89 `watch`, < 70 `risk`, no data `tbd`);
    `isTbd`, `isTextMode` (fixed 100 %), `isEditable` (`canEditTargets` ∧ not TBD ∧ not text mode ∧ open snapshot);
    `categoryLabel`; `warnings[]` per snapshot.
  - Dataset note (SCR-11 A3, CF-63 / CF-64): rows are the V2 table (22 KVIs, `KVI_DATA_BASE` L4159–4180) for screen parity;
    the tiles (V-27) and composition (V-31) aggregates come from the oracle (Excel D4) rows until the PO chooses one dataset.
  - Missing values are `null`, never `0`.
  - Front-only: number formatting per unit (es-CO: `10,69`, `1.870`, `7,4 %`, CF-70), chip colours from the band.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-121).
- Permissions: `canEditTargets` (Meta 2025 / Meta Reto inputs on editable rows; without it the cells render as mono text).
- budgetBytes: 16384
- Commands used: `C-16 PATCH /api/v1/kvis/:kviId/targets` (`{meta, metaReto}` on blur / Enter → recomputed row + `kpis` +
  composition, so V-27 tiles and V-31 refresh from the command response).
