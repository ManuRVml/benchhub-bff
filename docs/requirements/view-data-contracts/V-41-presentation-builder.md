<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-41-presentation-builder.md · copied 2026-09-25 -->

# V-41 — Presentation builder

- Endpoint: `GET /api/v1/views/presentation-builder/:presentationId` — SCR-13 builder "Nueva presentación".
- Screens: SCR-13 builder (Título / Fecha, Idioma, Tipo de presentación, "Tipos de slides a incluir" + slide count, Portada /
  Cierre, 7 module rows with chart pills and "Comentarios por slide", "Versión PPT cargada", "Comentarios" count, footer
  actions); slide previews come from V-42.
- Params:
  - `presentationId` (path, `PresentationId`) — the draft created by `C-27` (route `/presentaciones/:presentationId/editar`).
- Response (minimal JSON):

```json
{
  "meta": { "title": "", "date": null, "language": "es", "templateId": null },
  "templates": [
    { "id": "directorio", "name": "Directorio Ejecutivo", "description": "Mensajes clave, semáforos y ranking. Máximo 6 diapositivas.", "accentKey": "template.directorio" },
    { "id": "storytelling", "name": "Storytelling de Mercado", "description": "Narrativa de industria con contexto e IA generativa.", "accentKey": "template.storytelling" },
    { "id": "analitico", "name": "Detalle Analítico", "description": "Tablas completas, drill-down y anexos por categoría.", "accentKey": "template.detalleAnalitico" }
  ],
  "includeCover": true,
  "includeClosing": true,
  "modules": [
    { "id": "hom", "label": "Detalle y edición de datos por compañía", "charts": [
      { "id": "cards", "label": "Tarjetas de cobertura", "isSelected": false },
      { "id": "faltantes", "label": "Indicadores faltantes", "isSelected": false } ] },
    { "id": "comp", "label": "Comparativo GE vs. Promedio Pares", "charts": [
      { "id": "barras", "label": "Barras GE vs. pares", "isSelected": true },
      { "id": "tabla", "label": "Tabla de indicadores", "isSelected": false },
      { "id": "cat_rentabilidad", "label": "Por indicador · Rentabilidad", "isSelected": false } ] },
    { "id": "hallazgos", "label": "Hallazgos de IA", "charts": [
      { "id": "lista", "label": "Lista de hallazgos", "isSelected": true } ] }
  ],
  "slideCount": 7,
  "notes": { "comp|barras": "Destacar que GE supera al promedio en margen EBITDA pese a la caída del Brent." },
  "pendingNoteCount": 4,
  "uploadedVersion": null,
  "commentCount": 1,
  "permissions": { "canEdit": true, "canPublish": true, "canUpload": true, "canDraftWithAssistant": true }
}
```

- Raw vs derived:
  - Raw: `meta` (title, date ISO | `null`, language `es | en`, `templateId` `directorio | storytelling | analitico | null` —
    `null` renders as Directorio), template names / descriptions, module and chart labels, `isSelected`, `includeCover` /
    `includeClosing`, `notes` (analyst texts keyed `moduleId|chartId`), `uploadedVersion{fileName, sizeLabel, uploadedAt}`.
  - Derived by the BFF: `slideCount` (selected charts + cover + closing; default 7, "Seleccionar todo" → 24 = 22 charts + 2),
    `pendingNoteCount` (chart slides without a note — the "✦ Redactar comentarios con Yarbis (n)" badge, default 4),
    `commentCount`, `accentKey`s, the 7-module registry (hom 2, comp 8, pvc = the analysis company set (5), resumen 1,
    panorama 4, peso 1, hallazgos 1 — HTML L4859–4867), `sizeLabel` (e.g. "2,4 MB").
  - Front-only: "Seleccionar todo" / "Limpiar" are client-side selection changes persisted with `C-28`; the badge re-counts
    locally until the `C-28` response confirms `slideCount` [inference].
- Sections: single `SectionResult` for the builder card (the embedded comment thread loads separately from V-26).
- Permissions: `canEdit` (all builder inputs, autosave), `canPublish` ("Publicar presentación"), `canUpload` (OVL-07a,
  "Reemplazar", "Quitar"), `canDraftWithAssistant` ("✦ Sugerir con Yarbis", "✦ Redactar con Yarbis", batch drafting; CF-40).
  Only `analyst_creator` reaches this endpoint (others `403`).
- budgetBytes: 8192
- Commands used: `C-28 PATCH /api/v1/presentations/:presentationId` (autosave meta, template, modules / charts, cover /
  closing, order, notes), `C-29 POST …/publication`, `C-30 PUT …/uploaded-version`, `C-31 DELETE …/uploaded-version`, `C-32
  POST /api/v1/slide-comment-drafts` (single and client-batched up to 8), `C-14` (`presentation-pptx | presentation-pdf`,
  OVL-07b), `C-10` (builder "Comentarios", `entityType: presentation`).
