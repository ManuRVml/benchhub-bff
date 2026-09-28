<!-- origin: eco-comparator-web@b780f6e docs/design/view-data-contracts/V-32-value-monitor-configuration.md · copied 2026-09-28 -->

# V-32 — Value monitor configuration

- Endpoint: `GET /api/v1/views/value-monitor-configuration` — SCR-11 "Configuración del Monitor de Valor" (always visible,
  CF-19).
- Screens: SCR-11 section 7 ("Fechas, rango y fuentes", "Indicadores y métricas incluidos" chips + "+ Añadir indicador",
  "Excepciones, reglas variables y contexto", "Contexto abierto para Yarbis", "Aplicar configuración").
- Params: none (the configuration belongs to the monitor, not to a snapshot) [inference: V2 has a single config].
- Response (minimal JSON):

```json
{
  "cutOffDate": "2025-12-31",
  "rangeFrom": 2023,
  "rangeTo": 2025,
  "thresholds": { "alert": 70, "warning": 90 },
  "period": "quarter",
  "sources": [
    { "id": "capital_iq", "label": "Capital IQ", "isEnabled": true },
    { "id": "bloomberg", "label": "Bloomberg", "isEnabled": true },
    { "id": "platts", "label": "Platts", "isEnabled": false },
    { "id": "interna_ecp", "label": "Fuentes internas Ecopetrol", "isEnabled": true }
  ],
  "kvis": [
    { "id": "kvi_fcl", "label": "Flujo de Caja Libre", "isIncluded": true },
    { "id": "kvi_deuda", "label": "Deuda Bruta / EBITDA", "isIncluded": true },
    { "id": "kvi_cobertura", "label": "Cobertura de Intereses", "isIncluded": true },
    { "id": "kvi_efipareto", "label": "EFI Activos Pareto Upstream", "isIncluded": true },
    { "id": "kvi_tirpareto", "label": "TIR Activos Pareto Upstream", "isIncluded": true },
    { "id": "kvi_efic", "label": "Eficiencias", "isIncluded": true },
    { "id": "kvi_roace", "label": "ROACE", "isIncluded": true },
    { "id": "kvi_roacewacc", "label": "ROACE menos WACC", "isIncluded": true },
    { "id": "kvi_kviport", "label": "KVI del portafolio", "isIncluded": true },
    { "id": "kvi_trr", "label": "TRR (renta variable)", "isIncluded": true },
    { "id": "kvi_bond", "label": "Bond Spread (renta fija)", "isIncluded": true },
    { "id": "kvi_precio", "label": "Precio Objetivo Analistas", "isIncluded": true },
    { "id": "kvi_riesgocred", "label": "Calificación de Riesgo Crediticio", "isIncluded": true },
    { "id": "kvi_divid", "label": "Dividendos Recibidos", "isIncluded": true },
    { "id": "kvi_cti", "label": "CT+i", "isIncluded": true },
    { "id": "kvi_ebitdacapex", "label": "EBITDA / Capex (ISA)", "isIncluded": true },
    { "id": "kvi_divint", "label": "Dividendos recibidos / intereses pagados", "isIncluded": true },
    { "id": "kvi_margenebitda", "label": "Margen EBITDA ISA", "isIncluded": true },
    { "id": "kvi_costoenergia", "label": "Costo Energía GE", "isIncluded": true },
    { "id": "kvi_irr", "label": "IRR", "isIncluded": true },
    { "id": "kvi_diversif", "label": "Estrategia Diversificación", "isIncluded": true },
    { "id": "kvi_pib", "label": "Aporte al PIB", "isIncluded": true }
  ],
  "exceptionsText": "",
  "assistantContext": "",
  "permissions": { "canConfigure": true }
}
```

- Raw vs derived:
  - Raw: every field (stored configuration): `cutOffDate` (ISO date), `rangeFrom` / `rangeTo` (4-digit years, desde ≤ hasta
    validated by the BFF on `C-17` — SCR-11 A12), `thresholds{alert,warning}` and `period` (`quarter | year`, same shape
    `C-17` saves — added so a returning user sees their own saved config instead of the front's fixed defaults 70/90/quarter),
    source toggles, KVI inclusion (22 chips in table order), the two free texts.
  - Derived by the BFF: nothing on read; on `C-17` it decides whether the change needs a recalculation and returns
    `recalculationOperationId` (F22, M-06).
  - Front-only: date formatting (`31/12/2025`), chip styles.
- Sections: single `SectionResult` for the card (hidden entirely without `canConfigure`; CF-135).
- Permissions: `canConfigure` (edit + "Aplicar configuración" + "+ Añadir indicador"); without it the card is not rendered
  (SCR-11 States "Read-only").
- budgetBytes: 4096
- Commands used: `C-17 PUT /api/v1/value-monitor-configuration` (same body → optional `recalculationOperationId`, followed
  with O-01 / O-02), `C-08` (recalculation, started by the BFF when needed), `C-18` (from OVL-05, see V-34).
