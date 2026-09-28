<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-27-value-monitor.md · copied 2026-09-25 -->

# V-27 — Value monitor (header, KPI tiles, dimension weights)

- Endpoint: `GET /api/v1/views/value-monitor` — SCR-11 header card, KPI tiles and "Peso por dimensión".
- Screens: SCR-11 sections 1–3 (header meta + snapshot select + actions, 4 KPI tiles, Ecopetrol dimension weights); the
  permission flags also drive the header actions, the configuration card (V-32) and OVL-09 / OVL-02 triggers.
- Params:
  - `snapshot` (query, `SnapshotId`, default = latest, `2026-04`) — URL `corte`. Every Monitor widget is snapshot-scoped;
    closed snapshots are read-only (SCR-11 A11).
- Response (minimal JSON):

```json
{
  "header": {
    "analystName": "Camila Bravo",
    "updatedLabel": "Abril 2026",
    "status": "in_construction",
    "selectedSnapshotId": "2026-04",
    "snapshots": [
      { "id": "2026-04", "label": "Abril 2026", "note": "Corte vigente", "isClosed": false },
      { "id": "2026-01", "label": "Enero 2026", "note": "Cierre T4 2025", "isClosed": true }
    ]
  },
  "kpis": {
    "status": "ok",
    "data": { "globalPct": 96.15, "retoPct": 78.56, "atRiskCount": 1, "tbdCount": 3 }
  },
  "dimensionWeights": {
    "status": "ok",
    "data": { "fin": 45, "op": 30, "trans": 25 }
  },
  "permissions": {
    "canEditTargets": true,
    "canConfigure": true,
    "canSaveView": true,
    "canExport": true,
    "canOpenSensitivities": true,
    "canComment": true,
    "canUseAssistant": true
  }
}
```

- Raw vs derived:
  - Raw: `analystName`, snapshot `label` / `note`, `dimensionWeights` (Ecopetrol's declared weights 45 / 30 / 25, HTML
    L4607).
  - Derived by the BFF (engine port, never by the front): `kpis.globalPct` and `kpis.retoPct` — weighted Excel D4
    methodology, oracle `docs/design/oracles/kvi.json` (`expected.global` 96.15, `expected.reto` 78.56); the front only
    formats them (tile "96 %" integer, "78,6 %" one decimal, es-CO, CF-70); `atRiskCount`, `tbdCount` (rules open, OQ-07 —
    SCR-11 A2: the V2 rows give 0 at-risk / 2 TBD while the tiles show 1 / 3; the mock returns the tile values, CF-74);
    `status` enum (`in_construction | in_review | published`), `updatedLabel`, `isClosed`.
  - Dataset note (SCR-11 A3): the tiles are computed from the oracle rows, the KVI table (V-30) shows the V2 rows — two
    datasets until the PO picks one (CF-63 / CF-64).
  - Front-only: tile colours by band of the value (≥90 / 70–89 / <70), chip colours from `status`.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-126).
- Permissions: `canEditTargets` (Meta / Meta Reto inputs in V-30), `canConfigure` (configuration card V-32, "+ Añadir
  indicador"), `canSaveView` ("Guardar vista", "Mis vistas" V-47), `canExport` ("Descargar"), `canOpenSensitivities` ("Ir a
  Sensibilidades"), `canComment` (comment composer, V-26), `canUseAssistant` (Yarbis actions — OVL-09 narrative, OVL-02
  recommendations, CF-40).
- budgetBytes: 3072
- Commands used: `C-19` (save view, `{screen: 'value-monitor', state}`), `C-14` (`value-monitor-pdf` export), `C-15`
  (`{scope: 'value-monitor'}` narrative, OVL-09), `C-10` (comments; thread via V-26).
