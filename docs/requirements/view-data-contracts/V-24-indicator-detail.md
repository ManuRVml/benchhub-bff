<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-24-indicator-detail.md · copied 2026-09-25 -->

# V-24 — Indicator detail

- Endpoint: `GET /api/v1/views/indicator-detail/:analysisId/:indicatorId` — SCR-10 "Detalle de indicador" (fields
  reconciled with the merged `docs/design/screen-inventory/SCR-10-detalle-indicador.md` Data fields).
- Screens: SCR-10 title + context, KPI cards, grouped 2024 vs 2025 bar chart with average line, "✦ YARBIS INSIGHT",
  "Trazabilidad del dato" + "Ver cambios ›" history; the comments thread loads from V-26.
- Params:
  - `analysisId`, `indicatorId` (path, `AnalysisId`, `IndicatorId`) — from `/analisis/:analysisId/indicadores/:indicatorId`.
  - `origin` (query, `resultados | visualizacion | presentacion`, optional) — lives in the URL as `origen`; drives the
    back link only (front); the BFF uses it to allow executive_viewer only with `origen=presentacion` (SCR-10 Role
    visibility).
- Response (minimal JSON):

```json
{
  "indicator": { "id": "ind_roace", "label": "ROACE (%)", "unit": "percent", "contextKey": "above_peers" },
  "kpis": { "status": "ok", "data": { "ecopetrol": 7.4, "peerAvg": 5.5, "geVsAvgPct": 34.5, "deltaVsPeersPct": 34.5 } },
  "series": {
    "status": "ok",
    "data": {
      "periods": { "previous": { "label": "T4 2024" }, "current": { "label": "T4 2025" } },
      "rows": [
        { "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "isEcopetrol": true, "previous": 10.2, "current": 7.4, "deltaPct": -27.5 },
        { "companyId": "cmp_conocophillips", "name": "ConocoPhillips", "isEcopetrol": false, "previous": 9.0, "current": 7.2, "deltaPct": -20.0 },
        { "companyId": "cmp_shell", "name": "Shell", "isEcopetrol": false, "previous": 6.3, "current": 6.5, "deltaPct": 3.2 }
      ],
      "peerAvgCurrent": 5.5
    }
  },
  "insight": { "status": "ok", "data": { "text": "Ecopetrol supera el promedio de pares en este indicador, sosteniendo una posición competitiva incluso con presión en el entorno de mercado.", "status": "suggestion" } },
  "traceability": {
    "status": "ok",
    "data": {
      "source": "Capital IQ · Estados financieros trimestrales",
      "period": { "year": 2025, "quarter": 4 },
      "updatedAt": "2026-09-22T10:00:00-05:00",
      "history": [ { "text": "Alejandra actualizó la fuente a Capital IQ.", "occurredAt": "2026-09-22T10:00:00-05:00" } ]
    }
  },
  "permissions": { "canComment": true, "canRequestChange": true }
}
```

- Raw vs derived:
  - Raw: `indicator.label`, `unit` (`percent | kboe | ratio_x | usd_b | points`; Crecimiento Producción is `kboe`, never
    `%` — CF-67),
    `series.rows[].previous` / `current`, `traceability.source`, `history[].text`, `updatedAt`, `occurredAt`.
  - Derived by the BFF: `contextKey` (`above_peers | below_peers`, polarity-aware), `kpis.peerAvg`, `geVsAvgPct`,
    `deltaVsPeersPct` (subtitle delta; V2 uses a different peer base than `geVsAvgPct` — SCR-10 A2 proposes one peer set
    so both match, PO to confirm), `deltaPct` (1 decimal), `peerAvgCurrent`, `insight` (AI suggestion, CF-40), row order.
  - Front-only: title context text from `contextKey`, `periods` labels (CF-76), relative times ("hace 3 días"),
    bar heights and average-line position, es-CO formatting.
- Sections: `kpis`, `series`, `insight`, `traceability` — each a `SectionResult`; `indicator` + `permissions` are the
  primary datum (full-page error / 404 when the indicator has no detail).
- Permissions: `canComment` (F32 composer), `canRequestChange` (F33 request option); thread-level flags (`canReply`,
  `canResolve`) come from V-26.
- budgetBytes: 8192
- Commands used: `C-10 POST /api/v1/review-comments` (`entityType: indicator`), `C-12 POST /api/v1/change-requests`
  (`entityType: indicator`, `kind: data | scope | recalculation`); analyst-side `C-11` / `C-13` [proposed UI, critic M-05].
