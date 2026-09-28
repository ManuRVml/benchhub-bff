<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-10-company-coverage.md · copied 2026-09-25 -->

# V-10 — Company coverage

- Endpoint: `GET /api/v1/views/company-coverage/:analysisId` — SCR-08 module 2 "Detalle y edición de datos por compañía".
- Screens: SCR-08 module 2 (KPI band, AI insights, company coverage cards, add tile, edit area, missing rows).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp`, default `tbg`) — from the URL `horizonte`; the module is hidden in `union`.
  - `companyId` (query, `CompanyId`, default = first company of the set) — lives in the URL as `compania`.
- Response (minimal JSON):

```json
{
  "kpis": { "status": "ok", "data": { "companies": 5, "complete": 2, "incomplete": 1, "pendingIndicators": 7 } },
  "insights": {
    "status": "ok",
    "data": [
      { "id": "ins_complete_share", "text": "2 de 5 compañías tienen 90% o más de información completa." },
      { "id": "ins_top_missing", "text": "ISA concentra el mayor número de datos faltantes (3)." }
    ]
  },
  "companies": {
    "status": "ok",
    "data": {
      "items": [
        { "id": "cmp_chevron", "name": "Chevron", "initials": "CH", "colorKey": "chevron", "coveragePct": 96, "coverageStatus": "complete", "missingCount": 0 },
        { "id": "cmp_isa", "name": "ISA", "initials": "IS", "colorKey": "isa", "coveragePct": 52, "coverageStatus": "incomplete", "missingCount": 3 }
      ],
      "addableCompanies": [ { "id": "cmp_exxon", "name": "Exxon" } ]
    }
  },
  "selected": {
    "status": "ok",
    "data": {
      "companyId": "cmp_chevron",
      "groups": [
        {
          "dimension": "fin",
          "totalPct": 40,
          "items": [
            { "indicatorId": "ind_roace_relativo", "label": "ROACE relativo", "value": 20, "unit": "percent", "isEstimate": false, "justification": null }
          ]
        }
      ],
      "missing": [ { "indicatorId": "ind_prueba_acida", "label": "Prueba ácida", "value": null, "unit": "percent" } ]
    }
  },
  "permissions": { "canEditValues": true, "canAddCompany": true, "canRemoveCompany": true }
}
```

- Raw vs derived:
  - Raw: company `name`, item `label`, item `value` (override applied, original kept server-side), `isEstimate`,
    `justification`.
  - Derived by the BFF: `kpis.*` counts; `insights[].text` (rule templates of HTML L4405–4407, rendered server-side in es-CO);
    `coveragePct` (reported / required indicators, integer %); `coverageStatus` (`complete` ≥ 90, `needs_review` 70–89,
    `incomplete` < 70); `missingCount`; `addableCompanies` (pool minus set); `groups[].totalPct`; `initials`.
  - Missing values are `null`, never `0` (CF-37).
  - Front-only: tone colours from `coverageStatus`, percent formatting.
- Sections: `kpis`, `insights`, `companies`, `selected` — each a `SectionResult` (`ok | error | forbidden`) that can fail
  independently; the card renders whatever succeeded.
- Permissions: `canEditValues` (inputs, Real/Estimado toggle, "Guardar cambios"), `canAddCompany` (add tile),
  `canRemoveCompany` (card "✕").
- budgetBytes: 12288
- Commands used: `C-06 PATCH /api/v1/analyses/:analysisId/value-overrides` (batch `{companyId, indicatorId, value | null,
  isEstimate, justification?}`; "Guardar cambios"), `C-04 POST /api/v1/analyses/:analysisId/companies` (add; also the
  undo path), `C-05 DELETE /api/v1/analyses/:analysisId/companies/:companyId` (remove, committed after the 5 s undo window —
  SCR-08 A8).
