<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-42-presentation-slides.md · copied 2026-09-25 -->

# V-42 — Presentation slides

- Endpoint: `GET /api/v1/views/presentation-slides/:presentationId` — ready-to-paint slide list for the shared renderer.
- Screens: OVL-06 "Vista previa · {module} · diapositiva n/N" + "Orden de diapositivas" (builder preview) and the SCR-14 stage
  (viewer). Rendering rules per kind: `docs/design/slide-renderer.md` (P1-15b) — this contract carries its `Fields:` as JSON.
- Params:
  - `presentationId` (path, `PresentationId`).
  - `order` (query, optional comma list of slide keys) — preview of an unsaved OVL-06 reorder; default = the saved order
    (generation order: Portada → selected charts in module order → Cierre, custom order from `C-28` first, new slides appended).
- Response (minimal JSON):

```json
{
  "templateId": "directorio",
  "templateName": "Directorio Ejecutivo",
  "accentKey": "template.directorio",
  "language": "es",
  "slides": [
    { "key": "title", "kind": "title", "label": "Portada", "moduleLabel": "Portada", "pageLabel": "1 / 7",
      "subtitle": "Referenciamiento competitivo · T4 2025" },
    { "key": "comp|barras", "kind": "bars", "label": "Barras GE vs. pares", "moduleLabel": "Comparativo GE vs. Promedio Pares", "pageLabel": "2 / 7",
      "note": "Destacar que GE supera al promedio en margen EBITDA pese a la caída del Brent.",
      "title": "GE vs. Promedio Pares", "maxAbs": 130.7,
      "rows": [
        { "indicatorLabel": "ROACE (%)", "ecopetrolValue": 7.4, "peerAverageValue": 5.5, "unit": "percent" },
        { "indicatorLabel": "Margen EBITDA (%)", "ecopetrolValue": 39.0, "peerAverageValue": 32.0, "unit": "percent" }
      ] },
    { "key": "panorama|kpis", "kind": "summary", "label": "KPIs resumen", "moduleLabel": "Panorama comparativo de promedios", "pageLabel": "3 / 7",
      "ecopetrolWeightPct": { "financiera": 45, "operativa": 30, "transversal": 25 },
      "summaryText": "El grupo Ecopetrol mantiene margen EBITDA superior al promedio de pares a pesar de la caída general del sector." },
    { "key": "panorama|heatmap", "kind": "categories", "label": "Heatmap", "moduleLabel": "Panorama comparativo de promedios", "pageLabel": "4 / 7",
      "rows": [
        { "companyName": "Ecopetrol", "financieraPct": 45, "operativaPct": 30, "transversalPct": 25, "isEcopetrol": true },
        { "companyName": "TotalEnergies", "financieraPct": 62, "operativaPct": 20, "transversalPct": 24, "isEcopetrol": false }
      ] },
    { "key": "appendix", "kind": "appendix", "label": "Cierre", "moduleLabel": "Cierre", "pageLabel": "7 / 7",
      "supportEmail": "analisis.competitivo@ecopetrol.com.co" }
  ],
  "permissions": { "canReorder": true }
}
```

- Slide union (discriminator `kind`; common members `key`, `kind`, `label`, `moduleLabel`, `pageLabel`, `note?`): the 14
  kinds and their extra members, exactly as in `slide-renderer.md`:

  | kind | extra members |
  |---|---|
  | `title` | `subtitle` (template name comes from the top-level `templateName`) |
  | `bars` | `title`, `rows[]{indicatorLabel, ecopetrolValue, peerAverageValue, unit}`, `maxAbs` |
  | `table` | `title`, `rows[]{categoryLabel, indicatorLabel, ecopetrolValue, peerAverageValue, unit}` |
  | `pvc` | `companyName`, `companyColorKey`, `title`, `rows[]{indicatorLabel, ecopetrolValue, companyValue, unit, maxAbs}` |
  | `hom` | `cards[]{companyName, coveragePct, tone: complete\|review\|incomplete, missingCount}` |
  | `homMissing` | `rows[]{companyName, missingCount, coveragePct}` |
  | `radar` | `rows[]{dimensionLabel, ecopetrolWeightPct, peerAverageWeightPct}` |
  | `hallazgos` | `findings[]{text}` (≤ 5, `status: 'suggestion'`) |
  | `summary` | `ecopetrolWeightPct{financiera, operativa, transversal}`, `summaryText` |
  | `ranking` | `rows[]{rank, companyName, totalWeightPct, isEcopetrol, barPct}` (top 4) |
  | `categories` | `rows[]{companyName, financieraPct, operativaPct, transversalPct, isEcopetrol}` (Ecopetrol + top 2) |
  | `findings` | `rows[]{companyName, financieraPct, operativaPct, transversalPct, totalPct}` |
  | `appendix` | `supportEmail` |
  | `empty` | none (the list is `[{kind: 'empty'}]` when nothing is selected) |

- Raw vs derived:
  - Raw: indicator / company / dimension labels, Ecopetrol values, company values (`pvc`, seeded in the mock — CF-66),
    declared weights, analyst `note`s, `supportEmail` (config).
  - Derived by the BFF: slide composition and order, `pageLabel` ("{n} / {total}", counting cover and closing), row counts
    (6 / 7 / 6 → 4 / 5 / 4 when a note exists), `title`s with parameters, `peerAverageValue`, `maxAbs`, `tone`, counts, top-N
    selections, `rank`, `totalWeightPct` / `totalPct` (may exceed 100, CF-65), `barPct`, `findings` / `summaryText`
    (suggestions, OQ-19), `companyColorKey`, `accentKey`.
  - Front-only: bar widths from values (|v| / maxAbs × 82 %), heatmap opacity grading and stacked-bar normalisation
    (slide-renderer.md), 16:9 canvas scaling, es-CO number formatting (CF-70), signed values on positive-length bars (CF-72).
- Sections: single `SectionResult` for the deck (a failed load shows the stage error with retry); individual slides do not
  fail independently [inference: one composition query].
- Permissions: `canReorder` (OVL-06 ▲ / ▼ and "Restablecer"; analyst on own drafts).
- budgetBytes: 49152 (24 slides — the "Seleccionar todo" maximum with the default company set — at ≤ 2 KiB each)
- Commands used: `C-28 PATCH /api/v1/presentations/:presentationId` (persist `order` from OVL-06).
