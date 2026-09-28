<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/C-24-evaluate-weight-simulation.md · copied 2026-09-25 -->

# C-24 — Evaluate weight simulation

- Endpoint: `POST /api/v1/weight-simulation-evaluations`
- Triggered from: SCR-12 "Sensibilidades" → "Simular pesos" (§6) and "Simular escenario" (§3–4) panels (HTML L1466–1683)
- Request: two modes, discriminated by `mode`.
  - `weights` mode (§6 KVI weight sliders):
    ```json
    {
      "mode": "weights",
      "weights": [
        {
          "kviId": "branded-id",
          "weight": 15
        }
      ]
    }
    ```
  - `scenario` mode (§3 productivity/operating-costs sliders): `{ "mode": "scenario", "productivity": -5..10, "operatingCosts": -15..10 }` (step 1, default 0 for both; ranges per SCR-12 §3).
- Response: two modes, discriminated by `mode`.
  - `weights` mode:
    ```json
    {
      "mode": "weights",
      "score": 85,
      "variation": 5,
      "categories": {
        "productivity": {
          "before": 70,
          "after": 75
        },
        "operating_costs": {
          "before": 65,
          "after": 68
        }
      },
      "status": "calculated"
    }
    ```
  - `scenario` mode: simulated ROACE vs. the peer average (§4 "Brecha cerrada vs. pares"). Percent values are numbers
    in `%` units (e.g. `7.4`, not `0.074`), matching V-39.
    ```json
    {
      "mode": "scenario",
      "baseRoace": 7.4,
      "simulatedRoace": 8.1,
      "peerAvgRoace": 5.5,
      "gapClosedPct": 45,
      "status": "calculated"
    }
    ```
- Prose:
  - `status: "above_peers"` (scenario mode only) replaces `"calculated"` when `baseRoace` is already above `peerAvgRoace`:
    the gap-closed percentage is not meaningful once there's no gap, so the UI hides the gap bar/tooltip instead of
    showing a bogus 0% (CF-68/A2 — this is Ecopetrol's actual current state: 7,4% base vs. 5,5% peer average).
  - V-38 models the scenario sliders' static metadata (ranges, `baseRoace`, `peerAvgRoace`, presets); this command
    only evaluates a single drag.
- Permission required: `analyst_creator` role; analysis ownership or read permission
- Validation / errors:
  - INVALID_WEIGHT: weight must be between 0 and 1 (`weights` mode)
  - INVALID_SCENARIO_VALUE: productivity/operatingCosts out of range (`scenario` mode)
  - FORBIDDEN: user cannot evaluate weight simulation for this analysis
- Side effects: Performs stateless weight/scenario simulation calculation; returns score/variation/category impacts
  (`weights` mode) or simulated ROACE vs. peers (`scenario` mode)
- budgetBytes: 4096
- Notes: Feature F28
