<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-47-saved-views.md · copied 2026-09-25 -->

# V-47 — Saved views [proposed]

- Endpoint: `GET /api/v1/views/saved-views` — [proposed per critic M-07] list of the user's saved views for a screen.
- Screens: SCR-11 "Mis vistas" select in the snapshot row [proposed] (SCR-11 section 1, A8); reusable by other screens that
  save view state (F36) [inference].
- Params:
  - `screen` (query, `value-monitor`, required) — the screen id used by `C-19`.
- Response (minimal JSON):

```json
{
  "items": [
    {
      "id": "sv_01",
      "name": "Financiero en riesgo · Abril 2026",
      "createdAt": "2026-09-24T15:30:00-05:00",
      "state": { "corte": "2026-04", "historico": "actual", "categoria": ["financiero"], "cumplimiento": ["risk"] }
    }
  ],
  "permissions": { "canSaveView": true, "canDeleteView": true }
}
```

- Raw vs derived:
  - Raw: `name` (user-given or generated at save time [inference: V2 "Guardar vista" asks for no name]), `createdAt`, `state`
    (the URL state stored by `C-19`: `corte`, `historico`, `categoria[]`, `cumplimiento[]`).
  - Derived by the BFF: ownership filter (only the caller's views), order by `createdAt` desc, `permissions`.
  - Front-only: applying `state` to the URL (`vista=<id>` + the stored params), "Vista actual" placeholder option [proposed
    copy].
- Sections: single `SectionResult`; failure or an empty list hides "Mis vistas" (SCR-11 States).
- Permissions: `canSaveView` (show the select, save), `canDeleteView` ("✕" per option); executive_viewer has no saved views
  (§1.19 → `403`).
- budgetBytes: 4096
- Commands used: `C-19 POST /api/v1/saved-views` (`{screen, state}` → `{id}`), `C-20 DELETE /api/v1/saved-views/:viewId`.
