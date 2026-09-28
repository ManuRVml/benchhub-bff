<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-38-sensitivity-scenarios.md · copied 2026-09-25 -->

# V-38 — Sensitivity scenarios

- Endpoint: `GET /api/v1/views/sensitivity-scenarios` — SCR-12 §3–5 ("Variables de simulación", "ROACE · Before / After",
  Yarbis tip).
- Screens: SCR-12 sections 2–5 (the "Escenarios" eyebrow renders no preset cards, CF-10; sliders "Productividad" and "Costos
  operativos"; Base → Simulado strip; "Brecha cerrada vs. pares" progress; tip box).
- Params: none (Ecopetrol ROACE scenario only) [inference: V2 has a single scenario model].
- Response (minimal JSON):

```json
{
  "variables": [
    { "id": "productivity", "label": "Productividad", "unit": "percent", "min": -5, "max": 10, "step": 1, "default": 0 },
    { "id": "operating_costs", "label": "Costos operativos", "unit": "percent", "min": -15, "max": 10, "step": 1, "default": 0 }
  ],
  "baseRoace": 7.4,
  "peerAvgRoace": 5.5,
  "presets": [
    { "id": "base", "label": "Base", "values": { "productivity": 0, "operating_costs": 0 } },
    { "id": "optimistic", "label": "Optimista", "values": { "productivity": 5, "operating_costs": -5 } },
    { "id": "conservative", "label": "Conservador", "values": { "productivity": -3, "operating_costs": 3 } }
  ],
  "permissions": { "canSimulate": true }
}
```

- Raw vs derived:
  - Raw: variable definitions, `baseRoace` (7,4 %), `peerAvgRoace` (5,5 %).
  - Derived by the BFF (via `C-24`): simulated ROACE, `gapClosedPct` (0–100) or `status: above_peers` when Ecopetrol is
    already above the peer average (CF-68, OQ-09 — the progress bar and tip are hidden in that state), and the tip text key.
  - `presets` stays empty in v1 (README presets not rendered, CF-10; kept optional in the contract).
  - Front-only: slider UI, progress bar width from `gapClosedPct`, es-CO formats.
- Sections: none — bare payload per module; failure is the endpoint ApiError (CF-123).
- Permissions: `canSimulate` (sliders).
- budgetBytes: 1024
- Commands used: `C-24 POST /api/v1/weight-simulation-evaluations` (`{productivity, costs}` → ROACE before / after +
  `gapClosedPct` | `status`).
