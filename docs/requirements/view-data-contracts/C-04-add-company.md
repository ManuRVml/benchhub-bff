<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-04-add-company.md · copied 2026-09-25 -->

# C-04 — Add company to analysis

- Endpoint: `POST /api/v1/analyses/:analysisId/companies`
- Triggered from: SCR-08 "Resultados" → "Añadir compañía" button (HTML L720–1078)
- Request (minimal JSON):
```json
{
  "companyId": "branded-id"
}
```
- Response:
```json
{
  "added": true,
  "companyCount": 5
}
```
- Permission required: `analyst_creator` role; analysis ownership or collaborative editing permission
- Validation / errors:
  - ANALYSIS_NOT_FOUND: analysisId does not exist or user lacks access
  - COMPANY_NOT_FOUND: companyId does not exist
  - COMPANY_ALREADY_ADDED: company already in analysis peer set
  - FORBIDDEN: user cannot edit this analysis
- Side effects: Adds company to analysis peer set; recalculates weighted metrics; updates analysis metadata
- budgetBytes: 2048
