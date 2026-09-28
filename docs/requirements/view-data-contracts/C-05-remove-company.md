<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-05-remove-company.md · copied 2026-09-25 -->

# C-05 — Remove company from analysis

- Endpoint: `DELETE /api/v1/analyses/:analysisId/companies/:companyId`
- Triggered from: SCR-08 "Resultados" → "X" remove button on company chip (HTML L720–1078)
- Request (minimal JSON):
```json
{}
```
- Response:
```json
{
  "removed": true,
  "companyCount": 4
}
```
- Permission required: `analyst_creator` role; analysis ownership or collaborative editing permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - COMPANY_NOT_IN_ANALYSIS: companyId not in analysis peer set
  - MINIMUM_COMPANIES: cannot remove below minimum peer count
  - FORBIDDEN: user cannot edit this analysis
- Side effects: Removes company from analysis peer set; recalculates weighted metrics; updates analysis metadata
- budgetBytes: 2048
- Notes: Also used by "Deshacer" (undo) functionality
