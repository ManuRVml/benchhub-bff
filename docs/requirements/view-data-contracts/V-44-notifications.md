<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-44-notifications.md · copied 2026-09-25 -->

# V-44 — Notifications

- Endpoint: `GET /api/v1/views/notifications` — SCR-15 "Notificaciones".
- Screens: SCR-15 (search "Buscar notificaciones...", SEVERIDAD chips "Info" / "OK" / "Atención" / "Crítico", list items with
  type icon, type eyebrow, text, time and severity tag, empty state "No hay notificaciones que coincidan con la búsqueda o
  los filtros.").
- Params:
  - `q` (query, string, default empty) — URL `q`; matches the notification text.
  - `severity` (query, comma list of `info | success | warn | error`, default all) — URL `severidad`.
  - `page` (query, integer ≥ 1, default 1), `pageSize` (query, default 20) [inference: V2 lists all 11].
- Response (minimal JSON):

```json
{
  "items": [
    { "id": "ntf_chevron_t4", "type": "dato", "severity": "info", "text": "Nueva actualización disponible: Chevron T4 2025.",
      "createdAt": "2026-09-25T06:00:00-05:00", "isRead": false, "target": { "route": "/analisis/ana_desempeno_4t2025/resultados" } },
    { "id": "ntf_isa_bloqueo", "type": "dato", "severity": "error", "text": "ISA no ha remitido información del corte — bloquea 3 indicadores.",
      "createdAt": "2026-09-24T09:00:00-05:00", "isRead": false, "target": null },
    { "id": "ntf_mantenimiento", "type": "sistema", "severity": "info", "text": "Mantenimiento programado del sistema el sábado de 10pm a 12am.",
      "createdAt": "2026-09-19T08:00:00-05:00", "isRead": true, "target": null }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 11,
  "unreadCount": 11,
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `text`, `createdAt` (ISO datetime; V2 seeds relative strings "Hace 2 horas", "Ayer" … — the mock converts them to
    datetimes), `isRead`.
  - Derived by the BFF: `type` enum (`dato | comentario | publicacion | ia | noticia | colaboracion | sistema`, V2 `ALERTS`
    L3486–3498), `severity` enum, visibility filtering per role (consumers only see notifications about content they can
    access, §1.19), `target` (deep link to the related entity, `null` when none) [inference], `unreadCount` (same number as
    V-01), search and severity filtering, sort by `createdAt` desc.
  - Front-only: relative time (es-CO "hace 3 días", "ayer"), type icon and eyebrow label, severity chip labels ("Info" /
    "OK" / "Atención" / "Crítico") and colours (`severity.*`).
  - Note: SCR-15's inventory names the endpoint `GET /api/v1/notifications` and fields `title` / `description` / `timestamp`
    / `leida`; this contract follows synthesis §4.2 (view endpoints under `/api/v1/views/`, brief §4.1 rule 1) and the V2
    data shape (one `text` per item). SCR-15 also maps `C-35` / `C-36` to the schema / severity enum; they are the
    mark-read commands below.
- Sections: single `SectionResult` for the list (empty result → the V2 empty-state copy).
- Permissions: none (every role reads its own notifications; empty `permissions` object).
- budgetBytes: 8192
- Commands used: `C-35 PATCH /api/v1/notifications/:notificationId/read` (item click), `C-36 POST
  /api/v1/notifications/read-all` [inference: no V2 trigger; kept for the badge reset].
