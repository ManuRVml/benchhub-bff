<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-33-kvi-traceability.md · copied 2026-09-25 -->

# V-33 — KVI traceability

- Endpoint: `GET /api/v1/views/kvi-traceability/:kviId` — OVL-11 (KVI name click in the SCR-11 KVI table).
- Screens: OVL-11 (title = KVI name; "CATEGORÍA", "FUENTE", "FECHA DE CAPTURA", "RESPONSABLE", "UNIDAD").
- Params:
  - `kviId` (path, `KviId`).
  - `snapshot` (query, `SnapshotId`, default latest) — capture date is snapshot-specific [inference].
- Response (minimal JSON):

```json
{
  "kviId": "kvi_fcl",
  "label": "Flujo de Caja Libre",
  "categoryLabel": "Financiero",
  "source": "Capital IQ · fuentes internas Ecopetrol",
  "capturedAt": "2025-12-31",
  "owner": "Diego Gómez",
  "unit": "bcop",
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `label`, `categoryLabel`, `source` (V2 static copy for every KVI, HTML L5360 — product: per-KVI lineage),
    `capturedAt` (ISO date; V2 prints "Corte 2025-12-31", HTML L5361), `owner` (`null` → "—"), `unit` code.
  - Derived by the BFF: nothing.
  - Front-only: the "Corte" prefix and es-CO date (`Corte 31/12/2025`), unit label from the unit code.
- Sections: single `SectionResult` (the modal shows an inline error with retry on failure; CF-135).
- Permissions: none (read-only; empty `permissions` object).
- budgetBytes: 768
- Commands used: none.
