<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-19-comparison-profiles.md · copied 2026-09-25 -->

# V-19 — Comparison profiles

- Endpoint: `GET /api/v1/views/comparison-profiles/:analysisId` — SCR-08 module 9 "Perfiles de comparación" + "Ecopetrol en
  cada perfil".
- Gated: true — PQ-only module (CF-02, OQ-02, PLAN D10); omitted from V-09 when the PO disables it.
- Screens: SCR-08 module 9 (profile tabs, configuration column, results column, summary table).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `profileId` (query, `ProfileId`, default = first profile) — module-local tab, not in the URL [inference].
- Response (minimal JSON):

```json
{
  "profiles": [
    { "id": "prf_descarbonizacion", "name": "Perfil 1 · Descarbonización", "businessTypeId": "decarbonization_renewables" },
    { "id": "prf_hidrocarburos", "name": "Perfil 2 · Hidrocarburos", "businessTypeId": "hydrocarbons" },
    { "id": "prf_gas", "name": "Perfil 3 · Gas", "businessTypeId": "gas_lng" }
  ],
  "config": {
    "profileId": "prf_descarbonizacion",
    "name": "Perfil 1 · Descarbonización",
    "businessType": "decarbonization_renewables",
    "businessTypeOptions": ["all", "hydrocarbons", "upstream", "gas_lng", "decarbonization_renewables"],
    "indicators": {
      "fin": ["EBITDA de generación baja en carbono", "TSR relativo", "Retorno sobre patrimonio"],
      "op": ["Capacidad renovable (GW)", "Combustibles renovables (mta)", "Puntos de carga EV"],
      "trans": ["Índice de intensidad de carbono", "Intensidad de carbono ciclo de vida", "Proyectos de bajas emisiones"]
    },
    "validityYear": 2025,
    "validityYearOptions": [2023, 2024, 2025],
    "availablePeerIds": ["cmp_shell", "cmp_bp", "cmp_totalenergies", "cmp_equinor"],
    "peerIds": ["cmp_shell", "cmp_equinor"],
    "weights": { "fin": 40, "op": 25, "trans": 35 },
    "weightsTotal": 100
  },
  "result": {
    "score": 64.8,
    "peerAvg": 77.2,
    "gapPts": -12.4,
    "position": 3,
    "of": 3,
    "ranking": [
      { "companyId": "cmp_shell", "name": "Shell", "score": 77.6, "isEcopetrol": false },
      { "companyId": "cmp_equinor", "name": "Equinor", "score": 76.7, "isEcopetrol": false },
      { "companyId": "cmp_ecopetrol", "name": "Ecopetrol", "score": 64.8, "isEcopetrol": true }
    ],
    "insight": { "text": "Ecopetrol ocupa el puesto 3 de 3 con 64.8 pts (-12.4 vs. pares).", "status": "suggestion" }
  },
  "summaryTable": [
    { "profileId": "prf_descarbonizacion", "name": "Perfil 1 · Descarbonización", "subtitle": "Descarbonización · Renovables · Shell, Equinor", "year": 2025, "ecopetrolScore": 64.8, "peerAvg": 77.2, "gapPts": -12.4, "position": 3, "of": 3, "isActive": true },
    { "profileId": "prf_hidrocarburos", "name": "Perfil 2 · Hidrocarburos", "subtitle": "Hidrocarburos · Upstream · Exxon, Chevron, Petrobras, Pemex", "year": 2025, "ecopetrolScore": 66.2, "peerAvg": 70.5, "gapPts": -4.3, "position": 4, "of": 5, "isActive": false }
  ],
  "permissions": { "canEditProfiles": true, "canGenerateNarrative": true }
}
```

- Raw vs derived:
  - Raw: profile `name`, `businessType`, `validityYear`, `peerIds`, `weights` (user configuration, persisted by C-38..C-40),
    per-company dimension scores by vigencia (not sent; engine input).
  - Derived by the BFF: `indicators` (catalog by business type), `availablePeerIds`, `weightsTotal`, `result.*` (score,
    peer average, gap, position, ranking, insight — AI suggestion), `summaryTable[]`.
  - **Oracle (critic K.3, P4-22 acceptance):** Perfil 1, vigencia 2025, weights 40 / 25 / 35, Ecopetrol 64.8 —
    4 peers (Shell, BP, TotalEnergies, Equinor) → `peerAvg` 76.4, `gapPts` −11.6, `position` 5 of 5; 2 peers (Shell,
    Equinor) → `peerAvg` 77.2, `gapPts` −12.4, `position` 3 of 3 (SCR-08 module 9).
  - Front-only: bar colours, "100%" badge colour from `weightsTotal`, es-CO formatting (`64,8`, `-12,4 pts`, `3 de 3`).
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-121).
- Permissions: `canEditProfiles` (name, chips, peers, sliders, "+ Nuevo perfil", "Eliminar este perfil"),
  `canGenerateNarrative` (AI pill).
- budgetBytes: 8192
- Commands used: `C-38 POST /api/v1/comparison-profiles` (create), `C-39 PATCH /api/v1/comparison-profiles/:profileId`
  (update config → returns recomputed `result` + `summaryTable` row), `C-40 DELETE /api/v1/comparison-profiles/:profileId`,
  `C-15 POST /api/v1/executive-narratives` (`section: profiles`).
