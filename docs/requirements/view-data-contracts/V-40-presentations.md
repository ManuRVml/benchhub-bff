<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-40-presentations.md · copied 2026-09-25 -->

# V-40 — Presentations

- Endpoint: `GET /api/v1/views/presentations` — SCR-13 list "Presentaciones creadas".
- Screens: SCR-13 list table ("Nombre | Fecha de creación | Estado | Fecha de publicación | —", row actions "Editar" / "Ver
  detalle") and the "+ Crear presentación" toggle.
- Params:
  - `analysisId` (query, `AnalysisId`, optional) — set on `/analisis/:analysisId/presentaciones` (analysis tab
    "Presentación"); absent on the sidebar route, where the tab bar binds to `session.analysisContext` (CF-46, OQ-14).
  - `page` (query, integer ≥ 1, default 1), `pageSize` (query, default 20) [inference: V2 has 3 rows and no paging].
- Response (minimal JSON):

```json
{
  "items": [
    { "id": "prs_directorio_t4", "name": "Directorio Ejecutivo T4", "createdOn": "2025-10-02", "status": "published", "publishedOn": "2025-10-05",
      "permissions": { "canEdit": true, "canView": true } },
    { "id": "prs_storytelling", "name": "Storytelling de Mercado", "createdOn": "2025-09-28", "status": "in_review", "publishedOn": null,
      "permissions": { "canEdit": true, "canView": true } },
    { "id": "prs_resumen_sens_q3", "name": "Resumen Sensibilidades Q3", "createdOn": "2025-08-14", "status": "draft", "publishedOn": null,
      "permissions": { "canEdit": true, "canView": true } }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 3,
  "permissions": { "canCreate": true }
}
```

- Raw vs derived:
  - Raw: `name`, `createdOn`, `publishedOn` (ISO dates, `null` → "—").
  - Derived by the BFF: `status` enum (`published | in_review | draft`; front labels "Publicado" / "En revisión" /
    "Borrador"), row filtering by role (consumers get **published only**; drafts only for their analyst), sort by creation date
    desc [inference], per-row `permissions`.
  - Front-only: es-CO date format (`02 oct 2025`), status badge colours.
- Sections: single `SectionResult` for the list (the builder has its own view V-41).
- Permissions: `canCreate` ("+ Crear presentación", analyst only); per row `canEdit` ("Editar" → `/presentaciones/:id/editar`)
  and `canView` ("Ver detalle" → SCR-14). explorer_viewer gets `403` on this endpoint (§1.19).
- budgetBytes: 4096
- Commands used: `C-27 POST /api/v1/presentations` (`{analysisId}`, "+ Crear presentación" → draft id → builder route).
