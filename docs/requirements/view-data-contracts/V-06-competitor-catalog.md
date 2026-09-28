<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-06-competitor-catalog.md · copied 2026-09-25 -->

# V-06 — Competitor catalog (wizard step 2)

- Endpoint: `GET /api/v1/views/competitor-catalog?businessLine=all`
  Company catalog grouped by strategic category, plus the Yarbis suggestion. Same for every user: cached in the BFF with a
  TTL, `ETag` + `Cache-Control: private, max-age=300` [inference: TTL per ADR]. The selection lives in the draft (V-05
  `competitorIds`), not here.
- Screens: SCR-07 step 2 "Competidores" — "Línea de negocio" filter chips, grouped `Cmp:CompanyTile`s (name + "i" + meta
  "{país} · {categoría}"), Yarbis box. The tile "i" opens OVL-13 (V-25).
- Params:
  - `businessLine` (query, URL `linea`, enum `all | oil_gas | energeticos`, default `all`): filters groups. It is a view
    filter only, not saved in the draft; the selection persists when a group is hidden.
- Response (minimal JSON):
  ```json
  {
    "groups": [
      {
        "id": "super_majors",
        "label": "Super Majors",
        "businessLine": "oil_gas",
        "companies": [
          {
            "id": "cmp_exxon",
            "name": "Exxon",
            "country": "Estados Unidos",
            "category": "Super Major",
            "colorKey": "exxon"
          },
          {
            "id": "cmp_chevron",
            "name": "Chevron",
            "country": "Estados Unidos",
            "category": "Super Major",
            "colorKey": "chevron"
          }
        ]
      },
      {
        "id": "nocs",
        "label": "NOCs",
        "businessLine": "oil_gas",
        "companies": [
          {
            "id": "cmp_petrobras",
            "name": "Petrobras",
            "country": "Brasil",
            "category": "NOC",
            "colorKey": "petrobras"
          }
        ]
      }
    ],
    "suggestion": {
      "text": "te sugiero incluir Petrobras — comparte características NOC con Ecopetrol.",
      "companyId": "cmp_petrobras",
      "aiStatus": "suggestion"
    },
    "permissions": {}
  }
  ```
- Raw vs derived:
  - No numbers. Group labels and company names are data (proper nouns, not translated).
  - BFF derives: the grouping and group order (Super Majors, IOCs, NOCs, Junior Latam, Utilities & Renovables, Transmisión &
    Energía — SCR-07 step 2); the `businessLine` filter; `colorKey` (company colour map §2.7); the suggestion (AI,
    `aiStatus:'suggestion'`; the front renders the "✦ Yarbis:" lead before `text`, HTML L579). An unknown profile is returned as `country: null`, `category: null`; the front shows "— · Par
    sectorial".
  - The default selection of 7 companies is not here; it comes from the draft defaults (C-01).
- Sections: single catalog. On failure, a section error with retry inside step 2 only; the rest of the wizard works. A missing
  `suggestion` (null) hides the Yarbis box without failing the catalog.
- Permissions: none on the catalog (empty `ActionPermissions`); editing the selection is governed by V-05 `canEdit`.
- budgetBytes: 12288
- Commands used: C-02 (toggle a company or bulk select per group → `competitorIds`); V-25 via the tile "i" (OVL-13).
