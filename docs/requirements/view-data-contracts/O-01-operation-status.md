<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/O-01-operation-status.md · copied 2026-09-25 -->

# O-01 — Operation status (long-running jobs)

- Endpoint: `GET /api/v1/operations/:operationId`
  Status of an operation started by a `202 Accepted` command. The id is the BFF's own `operationId`, never a Databricks
  `job_id`/`run_id` (brief §4.1 rule 10). Polling fallback when SSE (O-02) is not available; the front polls with backoff,
  1 s → 5 s [inference].
- Screens: SCR-07 Definición "Generar análisis" (C-03 → progress → Resultados); SCR-08 Resultados "Actualizar" (C-08, F22) and
  "Excel" export (C-14); SCR-11 "Aplicar configuración" (C-17) and "Descargar" (C-14); SCR-13/SCR-14 download (C-14, OVL-07b).
  Rendered by the shared `Cmp:OperationProgress` state (M-06).
- Params:
  - `operationId` (path, branded `op_…`, from the `202` body of the starting command).
  - Not in the SPA URL: the progress UI is transient. After a reload the operation is lost for the UI; the result arrives as a
    notification (V-44) [inference].
- Response (minimal JSON):
  ```json
  {
    "id": "op_01J9ZM0Q4A",
    "kind": "analysis_generation",
    "status": "running",
    "progressPct": 45,
    "messageKey": "operation.analysisGeneration.calculating",
    "result": null,
    "error": null
  }
  ```
  On success, `result` is `{ "targetRoute": "/analisis/ana_01J9Y8D4T2/resultados" }` for generation/recalculation, or
  `{ "fileId": "fil_01J9ZM1R7B", "fileName": "resumen-informe-4T2025.xlsx" }` for exports. On failure, `error` is
  `{ "code": "…", "messageKey": "…" }`.
- Raw vs derived:
  - BFF-derived: `kind` (`analysis_generation | recalculation | export | configuration_apply`, English snake_case, CF-101);
    `status` (`queued | running | succeeded | failed`) mapped from the job orchestrator; `progressPct` (integer
    0–100, monotonic); `messageKey` (phase label, i18n on the front); `result.targetRoute` (per role).
  - Front: formats `progressPct` as a bar and "45 %" (es-CO) and resolves `messageKey`.
- Sections: single object; a `404` (unknown or foreign operation) ends the progress UI with a generic error.
- Permissions: only the user who started the operation (or with access to its target) can read it; others get `404` (no
  existence leak). No action flags.
- budgetBytes: 1024
- Commands used: started by C-03, C-08, C-14, C-17; the result file is downloaded with O-03; live updates come from O-02.
