<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-04-analyses.md · copied 2026-09-25 -->

# V-04 — Analyses list ("Todos los análisis creados")

- Endpoint: `GET /api/v1/views/analyses?q=&createdOn=&createdBy=&status=&ref=&page=1&pageSize=20`
  Paged list with server-side filters; `filterOptions` is computed over what the user can see. `ETag` + `Cache-Control:
private, no-cache`.
- Screens: SCR-06 Análisis — toolbar ("+ Crear nuevo análisis"), filter bar (search + Fecha / Creador / Estado selects +
  "Limpiar filtros"), analyses table with an expandable description row, pagination footer.
- Params (all mirror the SPA URL; absent = "todos"; a change resets `page`):
  - `q` (URL `q`, default empty): case-insensitive substring over name **or** description; debounced 300 ms [inference].
  - `createdOn` (URL `fecha`, ISO date, default all): exact match.
  - `createdBy` (URL `creador`, user id, default all): exact match.
  - `status` (URL `estado`, enum, default all): exact match on the current status.
  - `ref` (URL `ref=tbg-ilp`, default absent): no filtering effect in v1, only the active nav item (OQ-03).
  - `page` (URL `page`, default 1), `pageSize` (default 20, maximum 100, not in the URL) [inference: V2 has no pagination].
- Response (minimal JSON):
  ```json
  {
    "items": [
      {
        "id": "ana_01J9Y8D4T2",
        "name": "Desempeño comparativo — 4T 2025",
        "description": "Referenciamiento competitivo trimestral de Ecopetrol frente a pares del sector energético en solvencia, rentabilidad, liquidez, OPEX y crecimiento.",
        "createdOn": "2025-10-03",
        "createdBy": { "id": "usr_01J9Y7C2QK", "fullName": "Camila Bravo" },
        "status": "in_review",
        "canOpenResults": true
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 3,
    "filterOptions": {
      "createdOn": ["2025-10-03", "2025-01-14", "2025-08-22"],
      "createdBy": [
        { "id": "usr_01J9Y7C2QK", "fullName": "Camila Bravo" },
        { "id": "usr_01J9Y7C9JS", "fullName": "Jorge Salas" }
      ],
      "status": ["in_review", "published", "draft"]
    },
    "permissions": { "canCreate": true }
  }
  ```
- Raw vs derived:
  - Front formats `createdOn` (ISO date) → "03 oct 2025" (es-CO, lower-case month); `status` → i18n chip ("Borrador" / "En
    construcción" / "En revisión" / "Publicado"); `totalItems` / `page` → pager.
  - BFF derives: the role filter (explorers and executive_integral never receive drafts, §1.19); `filterOptions` (distinct
    values over the visible set, so explorers cannot learn creators of hidden drafts); per-row `canOpenResults` (decides "Ver
    detalle" → Resultados for the analyst, Visualización otherwise); the default order, creation date descending (PO to
    confirm vs fixture order, SCR-06 A3).
- Sections: single primary datum (the page). On failure the table card shows `Cmp:SectionError` with retry; the toolbar
  and filters stay usable. An empty `items` array renders "No se encontraron análisis con los filtros aplicados." (HTML
  L419–421) when filters are set, or a no-data note (copy pending, SCR-06 A5).
- Permissions: `canCreate` ("+ Crear nuevo análisis", analyst_creator only); per-row `canOpenResults`. The route is locked for
  executive_viewer (`403`, and A-04 `navigation` shows 🔒).
- budgetBytes: 16384
- Commands used: C-01 `POST /api/v1/analysis-drafts` `{type, fromAnalysisId?}` → `{draftId}` ("+ Crear nuevo análisis",
  then navigate to `/analisis/:draftId/definicion?paso=1`).
