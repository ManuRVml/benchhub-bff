<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-39-weight-simulator.md · copied 2026-09-25 -->

# V-39 — Weight simulator

- Endpoint: `GET /api/v1/views/weight-simulator` — SCR-12 §6–7 ("Simulador de pesos por indicador · Ecopetrol",
  "Recomendaciones de Yarbis para el plan estratégico").
- Screens: SCR-12 sections 6–7 (score strip, 4 category groups with weight sliders 0–30, "Restablecer pesos", 3 Yarbis tips,
  "Generar plan estratégico" → OVL-03).
- Params: none (Monitor de Valor context of the current snapshot, OQ-32) [inference].
- Response (minimal JSON):

```json
{
  "baseScore": 91.8,
  "categories": [
    {
      "id": "financiero", "label": "Financiero", "targetPct": 60,
      "kvis": [
        { "kviId": "kvi_fcl", "label": "Flujo de Caja Libre", "weightPct": 12, "monitorPct": 149, "band": "ok" },
        { "kviId": "kvi_deuda", "label": "Deuda Bruta / EBITDA", "weightPct": 6, "monitorPct": 108, "band": "ok" }
      ]
    },
    {
      "id": "grupos_interes", "label": "Grupos de Interés", "targetPct": 5,
      "kvis": [ { "kviId": "kvi_pib", "label": "Aporte al PIB", "weightPct": 5, "monitorPct": 101, "band": "ok" } ]
    }
  ],
  "recommendations": [
    { "kviId": "kvi_deuda", "label": "Deuda Bruta / EBITDA", "gapPts": 28, "weightPct": 6, "tone": "action" },
    { "kviId": "kvi_cobertura", "label": "Cobertura de Intereses", "gapPts": 25, "weightPct": 6, "tone": "action" },
    { "kviId": "kvi_precio", "label": "Precio Objetivo Analistas", "gapPts": 11, "weightPct": 5, "tone": "watch" }
  ],
  "permissions": { "canSimulate": true, "canGeneratePlan": true }
}
```

- Raw vs derived:
  - Raw: category `label`s and `targetPct` (60 / 15 / 20 / 5, `CAT_TARGETS` L4103), KVI `label`s and default `weightPct`
    (L4086–4101).
  - Derived by the BFF: `baseScore` (weighted score vs target, 91,8 % in V2), `monitorPct` (the KVI's Resultado Monitor from
    the engine), `band` (≥ 90 `ok`, ≥ 70 `watch`, else `critical`), `recommendations[]` ordered by gap × weight with `tone`
    (`watch` / `action`) and `gapPts` (default tips 28 / 25 / 11 pts
    [Paquete:2_Sensibilidades_pantalla_completa.jpg]); simulated score, variation and category status (`on_target | above
    | below`, |diff| ≤ 2 tolerance) come from `C-24`.
  - Front-only: slider UI, category bar, status copy ("En línea", "Excede la meta de categoría", "Por debajo de la meta de
    categoría") from the status enum, weight colour from `band`, tip sentence templates rendered from `gapPts` / `weightPct`
    [inference: the BFF may also return rendered text — keep one of the two, P4 decides].
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-123).
- Permissions: `canSimulate` (sliders, "Restablecer pesos"), `canGeneratePlan` ("Generar plan estratégico").
- budgetBytes: 6144
- Commands used: `C-24 POST /api/v1/weight-simulation-evaluations` (`{weights}` → `{score, variationPts, categories[]}`),
  `C-25 POST /api/v1/strategic-plans` (OVL-03 plan), `C-26 PATCH /api/v1/strategic-plans/:planId` ("Guardar en el
  análisis"), `C-14` (`kind: strategic-plan`, plan "Descargar").
