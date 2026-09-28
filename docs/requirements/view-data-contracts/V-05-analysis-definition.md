<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-05-analysis-definition.md · copied 2026-09-25 -->

# V-05 — Analysis definition (wizard frame, step 1 fields)

- Endpoint: `GET /api/v1/views/analysis-definition/:draftId?step=1`
  The draft being defined, per-step validity for the stepper and the option lists of step 1. Steps 2, 3 and 5 load their
  own catalogs (V-06, V-07, V-08) independently. `Cache-Control: no-store` (the draft is edited with autosave).
- Screens: SCR-07 Definición del análisis — stepper (5 steps), step 1 "Información general" form, step 4 "Fuentes" chips
  (derived from the selection), footer "‹ Anterior" / "Siguiente ›" / "Generar análisis".
- Params:
  - `draftId` (path; the route `/analisis/:analysisId/definicion` uses the draft id).
  - `step` (query, URL `paso`, integer 1..5, default 1, invalid → 1): the step the user sees. It only decides which
    `stepStatus` entry is `current`; the payload is the same for every step.
- Response (minimal JSON):
  ```json
  {
    "draft": {
      "id": "drf_01J9ZA2B3C",
      "type": "estrategico_tbg",
      "name": "Desempeño comparativo — 4T 2025",
      "objective": "Evaluar la posición competitiva de Ecopetrol al cierre del cuarto trimestre de 2025 frente a pares del sector energético.",
      "question": "¿Cómo se posiciona Ecopetrol frente a comparables en EBITDA, márgenes y producción en el 4T 2025?",
      "currentPeriod": { "year": 2025, "quarter": 4 },
      "comparedPeriod": { "year": 2025, "quarter": 3 },
      "cutOffDate": null,
      "scope": ["grupo_ecopetrol"],
      "competitorIds": [
        "cmp_chevron",
        "cmp_exxon",
        "cmp_shell",
        "cmp_equinor",
        "cmp_total",
        "cmp_bp",
        "cmp_pttep"
      ],
      "indicatorIds": ["ind_roace", "ind_margen_ebitda"],
      "sources": [
        { "id": "capital_iq", "isPrimary": true },
        { "id": "bloomberg", "isPrimary": false },
        { "id": "platts", "isPrimary": false }
      ]
    },
    "stepStatus": [
      { "step": 1, "status": "valid", "errors": [] },
      { "step": 2, "status": "valid", "errors": [] },
      { "step": 3, "status": "valid", "errors": [] },
      { "step": 4, "status": "valid", "errors": [] },
      { "step": 5, "status": "untouched", "errors": [] }
    ],
    "options": {
      "types": ["estrategico_tbg", "estrategico_ilp", "desempeno_pares"],
      "quarters": [1, 2, 3, 4],
      "years": [2022, 2023, 2024, 2025, 2026],
      "scopes": ["grupo_ecopetrol", "isa"]
    },
    "permissions": { "canEdit": true, "canGenerate": true }
  }
  ```
- Raw vs derived:
  - Front formats: `type` / `scope` / `sources[].id` → i18n labels ("Estratégico TBG", "Grupo Ecopetrol", "Capital IQ ·
    principal"); quarters show "Q1".."Q4" in selects and "T4 2025" elsewhere (CF-76); `cutOffDate` (ISO date | null) →
    `dd/mm/aaaa` date field.
  - BFF derives: `stepStatus` (valid / invalid / untouched plus field errors as `{field, messageKey}`; drives the stepper and
    the enabled footer); `sources` (the union of the selected indicators' sources, primary first, read-only in step 4,
    BR-14 / CF-56); `canGenerate` (steps 1–3 valid and user allowed). Name 3–120 chars, objective ≤ 500, question ≤ 300,
    compared period earlier than the current period, at least one scope / competitor / indicator: server-side validation
    [inference, SCR-07].
  - `temporalView` (CF-35) is not in the v1 contract (not rendered).
- Sections: single primary datum (the draft). If it fails, the page shows a full error with retry. The step 2/3/5 catalogs
  are separate endpoints (V-06, V-07, V-08) and fail inside their step only.
- Permissions: `canEdit` (false → read-only fields, e.g. another analyst's draft); `canGenerate` (enables "Generar
  análisis"). Route guard: analyst_creator only; others get `403` (SCR-17).
- budgetBytes: 6144
- Commands used:
  - C-02 `PATCH /api/v1/analysis-drafts/:draftId` (partial draft, debounced ~500 ms autosave) → updated `stepStatus`.
  - C-03 `POST /api/v1/analysis-drafts/:draftId/generation` → `202 {operationId}` → O-01/O-02 → Resultados.
  - C-01 created the draft (from SCR-06).
