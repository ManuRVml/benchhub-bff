<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-07-indicator-catalog.md · copied 2026-09-25 -->

# V-07 — Indicator catalog (wizard step 3)

- Endpoint: `GET /api/v1/views/indicator-catalog?source=pares&concepts=&horizons=`
  The indicator catalog of one source, grouped, with stable ids and display codes. Cached with a TTL (same for all users),
  `ETag`.
- Screens: SCR-07 step 3 "Selección de indicadores" — `Cmp:SourceTabs` "Referenciamiento de pares" | "TBG e ILP", concept
  filter chips (pares) or horizon filter chips (TBG e ILP), groups with `Cmp:IndicatorPill` / `Cmp:IndicatorRow` +
  `Cmp:HorizonBadge`, per-group select-all and selected count (BR-13), and the sub-title totals (replaces the static "6
  categorías · 34 indicadores", CF-73).
- Params (all in the SPA URL):
  - `source` (URL `fuente`, enum `pares | tbg_ilp`, default `pares`).
  - `concepts` (URL `conceptos`, comma list of `rentabilidad | liquidez | operacional | solvencia | opex`; only for
    `source=pares`; empty = all).
  - `horizons` (URL `horizontes`, comma list of `tbg | ilp`; only for `source=tbg_ilp`; empty = all).
- Response (minimal JSON):
  ```json
  {
    "source": "pares",
    "groups": [
      {
        "id": "rentabilidad",
        "label": "Rentabilidad",
        "items": [
          {
            "id": "ind_roace",
            "code": "PAR-01",
            "label": "ROACE",
            "unit": "percent",
            "concept": "rentabilidad",
            "horizon": null,
            "sources": ["capital_iq"]
          }
        ]
      }
    ],
    "totals": { "groups": 5, "indicators": 27 },
    "filterOptions": {
      "concepts": [
        "rentabilidad",
        "liquidez",
        "operacional",
        "solvencia",
        "opex"
      ],
      "horizons": []
    },
    "permissions": {}
  }
  ```
  For `source=tbg_ilp`, the groups are the dimensions `financiero` (27), `operativo` (15) and `transversal` (22), with 64 items
  `TBG-01`..`TBG-47` / `ILP-01`..`ILP-17`; each item carries `dimension` instead of `concept`, and `horizon: "tbg" | "ilp"`.
- Raw vs derived:
  - Front formats: `unit` codes (`percent`, `ratio_x`, `usd_b`, …) are shown only as a hint if needed; concept, dimension
    and horizon ids → i18n chip labels ("Rentabilidad", "TBG", …).
  - BFF derives: stable `id` (the selection key saved in the draft) vs display-only `code` (`PAR-nn` / `TBG-nn` / `ILP-nn`,
    CF-77); grouping; `totals` (groups and indicators after filters); `filterOptions`; the filter itself (empty = all).
- Sections: single catalog per source. On failure, a section error inside step 3 with retry; switching tab refetches. An empty
  group list is impossible with "empty = all", but an empty result from filters still renders totals 0 [inference].
- Permissions: none on the catalog; the selection is governed by V-05 `canEdit`.
- budgetBytes: 24576
- Commands used: C-02 (select / deselect items or whole groups → `indicatorIds`).
