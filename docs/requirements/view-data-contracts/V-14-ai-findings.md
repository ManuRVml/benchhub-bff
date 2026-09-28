<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-14-ai-findings.md · copied 2026-09-25 -->

# V-14 — AI findings

- Endpoint: `GET /api/v1/views/ai-findings/:analysisId` — right rail "Hallazgos de IA" of Resultados.
- Screens: SCR-08 sticky rail (visible in every horizon state).
- Params:
  - `analysisId` (path, `AnalysisId`).
  - `horizon` (query, `tbg | ilp | union`, default `tbg`) — from the URL `horizonte`.
- Response (minimal JSON):

```json
{
  "findings": [
    { "id": "fnd_margen_ebitda", "text": "El grupo Ecopetrol mantiene margen EBITDA superior al promedio de pares a pesar de la caída general del sector." },
    { "id": "fnd_isa_manual", "text": "3 indicadores dependen de la actualización manual de ISA — riesgo para el cierre del informe." }
  ],
  "status": "suggestion",
  "generatedBy": { "model": "mock-findings", "version": "1" },
  "permissions": {}
}
```

- Raw vs derived:
  - Derived by the BFF (AI suggestion, CF-40 / OQ-19): `findings[].text` (es-CO, max 5), `status` (always `suggestion`),
    `generatedBy` (provenance of the generator; no infrastructure ids).
  - Nothing raw; the front renders the texts as-is.
- Sections: none — the whole payload is one module; failure is the endpoint ApiError (CF-97).
- Permissions: none (read-only; empty `permissions` object).
- budgetBytes: 3072
- Commands used: none.
