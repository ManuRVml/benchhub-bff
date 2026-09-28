<!-- origin: eco-comparator-web@b780f6e docs/design/view-data-contracts/V-36-value-monitor-benchmark-radar.md · copied 2026-09-28 -->

# V-36 — Value monitor benchmark radar

- Endpoint: `GET /api/v1/views/value-monitor-benchmark-radar` — SCR-11 "Análisis multidimensional · Benchmark radial".
- Gated: true — PQ-only module (CF-08, OQ-04, PLAN D10), scope flag `benchmarkRadar` [flag name fixed here; SCR-11 section
  10 deferred it to P1-20]. When the PO disables it the Monitor does not render the module and this endpoint returns `404`.
- Screens: SCR-11 section 10 [Paquete:1_Monitor_de_Valor_pantalla.jpg] (company toggles ≤ 5, Año select, category pills,
  20-axis radar, "FORTALEZAS · TOP 3", "OPORTUNIDADES · BOTTOM 3", ✦ insight, PNG / PDF / PPT).
- Params:
  - `companies` (query, comma list of `CompanyId`, 1–5, default `cmp_ecopetrol,cmp_shell`; Ecopetrol always included
    [inference]).
  - `year` (query, integer, default = latest year with data [inference: PQ shows "2023" in the select but "2025" in the
    legend, SCR-11 A9]).
  - `category` (query, `all | financiero | mercado | estrategico | grupos_interes`, default `all`; PQ's "Sostenibilidad"
    pill has no KVI category, CF-48).
  - `compareWithPreviousYear` (query, boolean, default `false`) — "Comparar año anterior" [inference].
- Response (minimal JSON):

```json
{
  "radar": { "status": "ok", "data": { "axes": [{ "kviId": "kvi_fcl", "label": "Flujo de Caja Libre" }, { "kviId": "kvi_deuda", "label": "Deuda Bruta / EBITDA" }, { "kviId": "kvi_cobertura", "label": "Cobertura de Intereses" }, { "kviId": "kvi_efipareto", "label": "EFI Activos Pareto Upstream" }, { "kviId": "kvi_tirpareto", "label": "TIR Activos Pareto Upstream" }, { "kviId": "kvi_efic", "label": "Eficiencias" }], "series": [{ "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "year": 2025, "colorKey": "ecopetrol", "values": [100, 100, 75, 80, 83, 100] }, { "companyId": "cmp_shell", "name": "Shell", "year": 2025, "colorKey": "shell", "values": [88, 92, 90, 78, 81, 85] }] } },
  "ranking": { "status": "ok", "data": { "strengths": [{ "kviId": "kvi_fcl", "label": "Flujo de Caja Libre", "pct": 100 }, { "kviId": "kvi_deuda", "label": "Deuda Bruta / EBITDA", "pct": 100 }, { "kviId": "kvi_efic", "label": "Eficiencias", "pct": 100 }], "opportunities": [{ "kviId": "kvi_cobertura", "label": "Cobertura de Intereses", "pct": 75 }, { "kviId": "kvi_efipareto", "label": "EFI Activos Pareto Upstream", "pct": 80 }, { "kviId": "kvi_tirpareto", "label": "TIR Activos Pareto Upstream", "pct": 83 }] } },
  "insight": { "status": "ok", "data": { "text": "Ecopetrol muestra un desempeño sólido en Flujo de Caja Libre, Deuda Bruta / EBITDA, Eficiencias, con brechas relevantes frente al líder en Cobertura de Intereses, EFI Activos Pareto Upstream, TIR Activos Pareto Upstream.", "tone": "watch", "status": "suggestion", "generatedBy": { "model": "mock-llm", "version": "1" } } },
  "companyOptions": [ { "id": "cmp_bp", "name": "BP" }, { "id": "cmp_equinor", "name": "Equinor" } ],
  "yearOptions": [2023, 2024, 2025],
  "permissions": { "canExport": true, "canUseAssistant": true }
}
```

- Raw vs derived:
  - Raw: axis `label`s (the non-TBD KVIs), company `name`s, option lists.
  - Derived by the BFF: `series[].values` = min(Resultado Monitor, 100) per axis (normalised 0–100); `strengths` (top 3) and
    `opportunities` (bottom 3) of Ecopetrol (PQ values equal V2's capped results: 100 / 100 / 100 and 75 / 80 / 83);
    `insight` text (template or LLM, `status: 'suggestion'`, OQ-19); `colorKey` (Ecopetrol `chart.ecopetrol`, peers
    `company.*`, CF-11 / CF-47).
  - Data gap (SCR-11 A9): no V2 dataset holds peer KVI results; the mock seeds them deterministically [inference].
  - Front-only: radar geometry (ECharts, rings 25 / 50 / 75 / 100), axis label truncation (~16 chars + "…"), legend
    "{name} {year}".
- Sections: radar, ranking and insight are independent SectionResults (CF-136); an insight failure keeps the radar and ranking.
- Permissions: `canExport` (PNG / PDF / PPT), `canUseAssistant` ("✦ Analizar con IA").
- budgetBytes: 8192
- Commands used: `C-14` (`kind: radar-png` and PDF / PPT variants), `C-15` ("✦ Analizar con IA" refreshes `insight`
  [inference]).
