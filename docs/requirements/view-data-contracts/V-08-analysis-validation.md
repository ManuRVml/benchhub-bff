<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-08-analysis-validation.md · copied 2026-09-25 -->

# V-08 — Analysis validation (wizard step 5 summary)

- Endpoint: `GET /api/v1/views/analysis-validation/:draftId`
  Read-only summary of the draft before generation, with the exclusion alert (companies below the homologation threshold,
  BACKEND rule 1). `Cache-Control: no-store` (reflects the latest autosave).
- Screens: SCR-07 step 5 "Validación" — rows "Alcance", "Competidores seleccionados ({n})" (chips), "Indicadores a analizar"
  (groups "{label} ({count})" with chips), exclusion `Cmp:AlertBanner` (warning), footer "Generar análisis".
- Params: `draftId` (path). The step itself is `paso=5` in the SPA URL (owned by V-05).
- Response (minimal JSON):
  ```json
  {
    "scope": {
      "entities": ["grupo_ecopetrol"],
      "cadence": "quarterly",
      "currentPeriod": { "year": 2025, "quarter": 4 }
    },
    "competitors": [
      { "id": "cmp_chevron", "name": "Chevron" },
      { "id": "cmp_exxon", "name": "Exxon" }
    ],
    "indicatorGroups": [
      {
        "id": "rentabilidad",
        "label": "Rentabilidad",
        "count": 3,
        "items": [
          { "id": "ind_roace", "label": "ROACE" },
          { "id": "ind_margen_ebitda", "label": "Margen EBITDA" }
        ]
      }
    ],
    "exclusionAlert": {
      "thresholdPct": 60,
      "companies": [{ "id": "cmp_isa", "name": "ISA", "coveragePct": 52 }]
    },
    "permissions": { "canGenerate": false }
  }
  ```
- Raw vs derived:
  - Front formats: `scope` → "Grupo Ecopetrol · Trimestral T4 2025" (i18n for entities and cadence, period formatter "T4
    2025", CF-76), so the BFF sends structure, not a pre-built Spanish string (SCR-07 proposed a BFF string; structured keeps
    copy in i18n); `competitors.length` → "({n})"; `thresholdPct` / `coveragePct` → `60 %` / `52 %`.
  - BFF derives: `indicatorGroups` (the step 3 selection grouped by concept or dimension, with `count`), `exclusionAlert`
    (null when no company is under the threshold; the threshold is configurable, OQ-27), `canGenerate`. The ISA 52 % in the
    example is illustrative: V2 has no literal exclusion case.
- Sections: single primary datum. On failure, a step 5 error with retry and "Generar análisis" disabled. `exclusionAlert: null`
  is the normal case (no banner).
- Permissions: `canGenerate` (all required steps valid, analyst_creator, draft owner). Generation with an exclusion alert is
  allowed (a warning, not an error) [inference].
- budgetBytes: 8192
- Commands used: C-03 `POST /api/v1/analysis-drafts/:draftId/generation` → `202 {operationId}` → O-01/O-02 progress → target
  Resultados (`result.targetRoute`).
