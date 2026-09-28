<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-12-company-comparison.md · copied 2026-09-25 -->

# V-12 — Company comparison

- Endpoint: `GET /api/v1/views/company-comparison/:analysisId` — SCR-08 module 4 "Comparativo GE vs. compañía · detalle
  por indicador" (PVC).
- Screens: SCR-08 module 4 (win-ratio summary, company tabs, category accordions, indicator rows with editable company
  value).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp | union`, default `tbg`) — from the URL `horizonte`.
  - `companyId` (query, `CompanyId`, default = first company of the set) — lives in the URL as `pvc`.
- Response (minimal JSON):

```json
{
  "company": { "id": "cmp_chevron", "name": "Chevron", "colorKey": "chevron" },
  "summary": { "wins": 6, "total": 10, "winPct": 60 },
  "groups": [
    {
      "category": { "id": "rentabilidad", "label": "Rentabilidad" },
      "wins": 2,
      "total": 3,
      "rows": [
        {
          "indicatorId": "ind_roace",
          "code": "IND-ROACE",
          "label": "ROACE (%)",
          "unit": "percent",
          "geValue": 7.4,
          "companyValue": 6.3,
          "diff": 1.1,
          "diffUnit": "points",
          "lowerIsBetter": false,
          "outcome": "above",
          "hasDetail": true
        }
      ]
    },
    {
      "category": { "id": "opex", "label": "Competitividad OPEX" },
      "wins": 1,
      "total": 2,
      "rows": [
        {
          "indicatorId": "ind_costo_levant",
          "code": "IND-COSTO-LEVANT",
          "label": "Costo de Levantamiento (USD/B)",
          "unit": "usd_b",
          "geValue": 12.2,
          "companyValue": 4.7,
          "diff": 7.5,
          "diffUnit": "usd_b",
          "lowerIsBetter": true,
          "outcome": "below",
          "hasDetail": false
        }
      ]
    }
  ],
  "permissions": { "canEditValues": true }
}
```

- Raw vs derived:
  - Raw: `geValue`, `companyValue` (per-company homologated value, override applied; `null` when missing), `label`, `unit`,
    `lowerIsBetter` (catalog attribute — replaces V2's id regex `deuda|opex|costo|gasto`, HTML L4785).
  - Derived by the BFF: `code` (display code from the stable id), `diff` (GE − company, 1 decimal), `diffUnit` (`points`
    when the indicator unit is `percent`), `outcome` (`above | below` with polarity), group `wins` / `total`, `summary.*`.
    A row with `companyValue: null` has `diff: null`, `outcome: null` and is excluded from wins / total (SCR-08 module 4).
  - Company values in fixtures reproduce V2's seeded synthetic values (CF-66).
  - Front-only: bar widths (`× 1.1` scale, HTML L4800), signed diff text, status chip colours.
- Sections: none — the whole payload is one module; failure is the endpoint ApiError (CF-97).
- Permissions: `canEditValues` (company value input).
- budgetBytes: 8192
- Commands used: `C-06 PATCH /api/v1/analyses/:analysisId/value-overrides` (`{companyId, indicatorId, value}`), `C-15 POST
  /api/v1/executive-narratives` (`section: pvc`).
