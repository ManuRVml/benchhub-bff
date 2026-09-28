<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-17-tbg-horizon.md · copied 2026-09-25 -->

# V-17 — TBG / ILP horizon

- Endpoint: `GET /api/v1/views/tbg-horizon/:analysisId` — SCR-08 module 7 "Horizonte TBG" / "Horizonte TBG y ILP", its
  "Por compañía" weight editor, OVL-15 "Detalle por compañía (TBG e ILP)" and the S-UNION side-by-side panel.
- Gated: false — the endpoint backs the horizon states S-ILP / S-UNION required by CF-04 (critic M-01). The PQ-only
  sub-blocks inside module 7 (KPIs generales, composition, principales indicadores) follow the module-7 `[gated]` flag of
  the SCR-08 inventory: when the PO disables them the BFF returns `summary: null` and the front hides those sub-blocks,
  while `union` keeps working [inference: resolves the SCR-08 module-7 `[gated]` tag vs synthesis V-17 ungated].
- Screens: SCR-08 module 7 (S-TBG, S-ILP, S-UNION), OVL-15, OVL-01 (recommendations come from V-23 `scope=horizon`).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp | union`, default `tbg`) — lives in the URL as `horizonte=tbg|ilp|tbg-ilp` (critic M-01).
  - `view` (query, `summary | company`, default `summary`) — module tab "Resumen general" / "Por compañía"; not in the URL
    [inference].
  - `companyId` (query, `CompanyId`) — editor / union / OVL-15 company; defaults `cmp_bp` for the editor (V2
    `qualCompanyId:'bp'`) and `cmp_shell` for union (V2 `qualUnionCompanyId:'shell'`); not in the URL [inference].
  - `detail` (query, boolean, default `false`) — when `true` the response adds `companyDetail` (OVL-15, critic M-03).
- Response (minimal JSON):

```json
{
  "horizon": "union",
  "summary": {
    "kpis": { "companies": 11, "avgFinPct": 47, "avgOpPct": 22, "avgTransPct": 33 },
    "composition": [
      { "companyId": "cmp_bp", "name": "BP", "finPct": 55, "opPct": 15, "transPct": 31, "finOpPct": null, "totalPct": 101, "sumStatus": "over" },
      { "companyId": "cmp_equinor", "name": "Equinor", "finPct": 34, "opPct": 17, "transPct": 34, "finOpPct": 17, "totalPct": 102, "sumStatus": "over" }
    ],
    "mainIndicators": [
      {
        "dimension": "fin",
        "foci": [
          {
            "title": "Generación de caja",
            "items": [ { "companyId": "cmp_oxy", "label": "Flujo de caja libre (FCL) antes de capital de trabajo", "weightPct": 40 } ],
            "ecopetrolText": "Flujo de Caja Libre (10%)",
            "ecopetrolStatus": "defined"
          }
        ]
      },
      {
        "dimension": "op",
        "foci": [
          {
            "title": null,
            "items": [ { "companyId": "cmp_isa", "label": "Confiabilidad y Disponibilidad de la Red", "weightPct": 20 } ],
            "ecopetrolText": null,
            "ecopetrolStatus": "in_definition"
          }
        ]
      }
    ],
    "topIndicators": null
  },
  "companyEditor": {
    "companyId": "cmp_shell",
    "groups": [
      {
        "dimension": "trans",
        "totalPct": 25,
        "items": [
          { "indicatorId": "ind_shell_ifsp", "label": "IFSP N1 y N2", "weightPct": 7.5, "isHito": false, "subItems": [] }
        ]
      }
    ],
    "totalPct": 100,
    "sumStatus": "ok"
  },
  "union": {
    "companyId": "cmp_shell",
    "companyOptions": [ { "id": "cmp_shell", "name": "Shell", "hasIlp": true }, { "id": "cmp_chevron", "name": "Chevron", "hasIlp": false } ],
    "tbg": { "dims": [ { "dimension": "fin", "totalPct": 35, "items": [ { "label": "Flujo de caja de actividades operativas", "weightPct": 35, "isHito": false, "subItems": [] } ] } ], "totalPct": 100, "indicatorCount": 9 },
    "ilp": {
      "dims": [
        { "dimension": "fin", "totalPct": 75, "items": [ { "label": "Retorno Total al Accionista Relativo", "weightPct": 25, "isHito": false, "subItems": [] } ] },
        { "dimension": "trans", "totalPct": 25, "items": [ { "label": "Hito: Avance en la transición energética", "weightPct": 25, "isHito": true, "subItems": ["Intensidad de carbono", "Reducción GEI 1 y 2", "Crecimiento negocio de energía", "Combustibles bio", "Desarrollo sumidero de emisiones"] } ] }
      ],
      "totalPct": 100,
      "indicatorCount": 3,
      "hitoCount": 1
    }
  },
  "companyDetail": null,
  "permissions": { "canEditWeights": true }
}
```

  `companyDetail` when `detail=true` (OVL-15):

```json
{
  "companyDetail": {
    "companyId": "cmp_bp",
    "name": "BP",
    "tbg": { "indicatorCount": 6, "dims": [ { "dimension": "fin", "totalPct": 55, "items": [ { "label": "Flujo de Caja Libre (Normalizado)", "weightPct": 30 } ] } ] },
    "ilp": { "indicatorCount": 5, "hitoCount": 0, "dims": [ { "dimension": "fin", "totalPct": 50, "items": [ { "label": "ROACE", "weightPct": 25, "isHito": false, "subItems": [] } ] } ] }
  }
}
```

- Raw vs derived:
  - Raw: every item `label` and `weightPct` (declared weight; decimals allowed — Shell 7,5 / 7,5, CF-65, OQ-08), `isHito`,
    `subItems[]` (hito components, critic M-01), focus `items[]` and `ecopetrolText`.
  - Derived by the BFF: `kpis.*` (averages over companies, integers; the hybrid Financiera/Operativa dimension counts half
    to each, HTML L4471), `composition[].*Pct` and `totalPct` (sums of item weights, 1 decimal), `sumStatus` (`ok` within
    99,5–100,5, `over`, `under`), `mainIndicators` (top 3 per dimension for op / trans; curated foci for fin),
    `ecopetrolStatus`, group / column `totalPct`, `indicatorCount`, `hitoCount`, `hasIlp`.
  - `topIndicators` is always `null` in v1: the "Top 3 indicadores con mayor peso individual" widget is dropped (critic
    M-02, proposed CF-87); the field stays optional so the PO can re-enable it.
  - Horizon behaviour: `horizon=tbg` → `summary` over `QUAL_DATA` (11 companies) + `companyEditor`; `horizon=ilp` →
    `summary` over the 7 companies with ILP data; `horizon=union` → `union` populated, `summary` may be `null`; companies
    without ILP data return `ilp: null` in `union` (no Shell fallback — SCR-08 A2).
  - Front-only: dimension colours, "Total:" colour from `sumStatus`, segment widths, hito rendering.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-121). Unrequested blocks are `null`.
- Permissions: `canEditWeights` ("Por compañía" editor inputs, C-07).
- budgetBytes: 24576
- Commands used: `C-07 PATCH /api/v1/analyses/:analysisId/weight-overrides` (batch `{companyId, horizon, indicatorId,
  weightPct}`; accepts and returns `warnings[]` when a company sum is outside 99,5–100,5); OVL-01 content via `V-23
  GET /api/v1/views/weight-recommendations/:analysisId?scope=horizon`.
