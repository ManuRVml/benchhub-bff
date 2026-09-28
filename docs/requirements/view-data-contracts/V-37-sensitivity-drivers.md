<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-37-sensitivity-drivers.md · copied 2026-09-25 -->

# V-37 — Sensitivity drivers

- Endpoint: `GET /api/v1/views/sensitivity-drivers` — SCR-12 §1 "Sensibilidad por indicador · palancas reales de Ecopetrol".
- Screens: SCR-12 section 1 (indicator pills, formula box, 3 lever sliders with linked variables, Base → Simulado + "Brecha
  vs. meta", Yarbis suggestion box).
- Params:
  - `indicator` (query, `IndicatorId`, default `ind_roace`) — URL `indicador`; only `isReady` indicators are accepted, others
    fall back to ROACE.
- Response (minimal JSON):

```json
{
  "indicators": [
    { "id": "ind_roace", "label": "ROACE", "isReady": true },
    { "id": "ind_margen_ebitda", "label": "Margen EBITDA", "isReady": false },
    { "id": "ind_deuda_bruta_ebitda", "label": "Deuda Bruta / EBITDA", "isReady": false }
  ],
  "formula": {
    "expression": "ROACE = NOPAT / Capital empleado",
    "terms": [
      "NOPAT = Ingresos operacionales − Costos y gastos operativos − Depreciación y amortización − Impuesto de renta",
      "Capital empleado = Activos totales − Pasivos corrientes"
    ]
  },
  "levers": [
    { "id": "lev_energy_cost", "label": "Costo de energía eléctrica", "unit": "percent", "min": -10, "max": 5, "step": 1, "default": 0,
      "linked": { "label": "Eficiencia energética (recalculada)", "unit": "percent", "factor": -0.6 } },
    { "id": "lev_contracted_services", "label": "Servicios contratados", "unit": "mmcop", "min": -10000, "max": 5000, "step": 500, "default": 0 },
    { "id": "lev_production_volume", "label": "Volumen de producción", "unit": "percent", "min": -5, "max": 8, "step": 1, "default": 0,
      "linked": { "label": "Costo de levantamiento (recalculado)", "unit": "percent", "factor": 0.4 } }
  ],
  "base": { "value": 7.4, "unit": "percent" },
  "target": { "value": 7.9, "unit": "percent" },
  "suggestion": {
    "id": "sug_roace_mix_1",
    "levers": { "lev_energy_cost": -5, "lev_contracted_services": -5000, "lev_production_volume": 3 },
    "estimatedResult": 8.1,
    "status": "requires_validation",
    "validatedBy": null,
    "validatedAt": null
  },
  "permissions": { "canSimulate": true, "canValidateSuggestion": true, "canSaveSimulation": true }
}
```

- Raw vs derived:
  - Raw: indicator labels, formula strings, lever definitions (label, unit, min / max / step, default), `base` (Ecopetrol
    ROACE 7,4 %) and `target` (7,9 %) — the fixed scale of CF-62 / OQ-09 (V2 shows 74 / 79, a ×10 defect).
  - Derived by the BFF: `isReady`, `suggestion` (lever combination + `estimatedResult`, a Yarbis suggestion that requires
    human validation — `status: requires_validation | validated`, BR-22) [inference: the 8.1 estimate is illustrative];
    simulated value, gap and linked values come from `C-21`, never computed in the front.
  - Front-only: slider UI, es-CO number formats (`7,4 %`, `−5.000 MMCOP`, `0,5 pts`), gap colour (≤ 0 green, < 2 amber, else
    red).
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-123).
- Permissions: `canSimulate` (sliders, "Cargar en controles"), `canValidateSuggestion` ("Marcar como validada"),
  `canSaveSimulation` (save to the analysis).
- budgetBytes: 4096
- Commands used: `C-21 POST /api/v1/sensitivity-evaluations` (debounced `{indicatorId, levers}` → `{base, simulated, target,
  gap, linked[]}`), `C-22 POST /api/v1/sensitivity-suggestions/:suggestionId/validation`, `C-23 POST
  /api/v1/sensitivity-simulations` (save target per OQ-32).
