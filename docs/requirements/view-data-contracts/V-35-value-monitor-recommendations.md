<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-35-value-monitor-recommendations.md · copied 2026-09-25 -->

# V-35 — Value monitor recommendations

- Endpoint: `GET /api/v1/views/value-monitor-recommendations` — OVL-02 "Recomendaciones estratégicas de Yarbis".
- Screens: OVL-02, opened by the PQ button "✦ Recomendaciones estratégicas IA" in the SCR-11 header (CF-07 "Both", SCR-11
  A1) [Paquete:1_Monitor_de_Valor_pantalla.jpg].
- Params:
  - `snapshot` (query, `SnapshotId`, default latest) — URL `corte`.
- Response (minimal JSON):

```json
{
  "items": [
    { "dimension": "fin", "label": "Financiera", "tone": "ok", "text": "alineado con el sector (45% vs. 43% promedio). Mantener el peso actual." },
    { "dimension": "op", "label": "Operativa", "tone": "ok", "text": "alineado con el sector (30% vs. 30% promedio). Mantener el peso actual." },
    { "dimension": "trans", "label": "Transversal", "tone": "ok", "text": "alineado con el sector (25% vs. 28% promedio). Mantener el peso actual." }
  ],
  "status": "suggestion",
  "generatedBy": { "model": "mock-recommendations", "version": "1" },
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: dimension `label`.
  - Derived by the BFF: `tone` (`ok` when |Δ| < 6 pts, else `watch` (Ecopetrol above the sector) or `action` (below, names
    the leader) — HTML L4702–4705, same rule as V-23) and the rendered `text` in es-CO (deterministic templates, OQ-19),
    `status: 'suggestion'`, `generatedBy`. Inputs: Ecopetrol weights 45 / 30 / 25 vs the peer average 43 / 30 / 28.
  - Front-only: row colours by tone (ok `#047857`/`#D1FAE5`, watch `#92400E`/`#FEF3C7`, action `#EF4444`/`#FEE2E2`) and the
    bold "{label}." prefix.
- Sections: single `SectionResult` (CF-135).
- Permissions: none on read; the trigger button is shown only with V-27 `permissions.canUseAssistant` (CF-40).
- budgetBytes: 2048
- Commands used: none.
