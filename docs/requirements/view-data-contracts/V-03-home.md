<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-03-home.md · copied 2026-09-25 -->

# V-03 — Home (Inicio)

- Endpoint: `GET /api/v1/views/home`
  Reference view of the view-composer pattern (P4-14): five sections composed with `Promise.allSettled`, each a
  `SectionResult`. `ETag` + `Cache-Control: private, max-age=60` [inference].
- Screens: SCR-05 Inicio — Yarbis insight banner, "Resumen ejecutivo" KPI cards, "Análisis habilitados" cards, "Noticias de
  los pares" carousel, "Indicadores de mercado".
- Params: none (route `/inicio`, no URL params). The news carousel pages on the client over `peerNews` (max 5 per page;
  the pager shows only with more than 5 items).
- Response (minimal JSON):
  ```json
  {
    "banner": {
      "status": "ok",
      "data": {
        "text": "Detecté 3 cambios relevantes en el sector durante las últimas 24 horas: caída de margen en Shell, alza de producción en Chevron y una noticia crítica de ISA que bloquea 3 indicadores.",
        "aiStatus": "suggestion"
      }
    },
    "executiveSummary": {
      "status": "ok",
      "data": {
        "total": 8,
        "active": 6,
        "published": 3,
        "inProgress": 2,
        "avgCoveragePct": 82
      }
    },
    "enabledAnalyses": {
      "status": "ok",
      "data": [
        {
          "id": "ana_01J9Y8C3N6",
          "title": "Informe de referenciamiento de pares",
          "status": "published",
          "description": "Seguimiento trimestral de Ecopetrol vs. 14 compañías del sector.",
          "updatedAt": "2026-09-22T14:05:00-05:00",
          "ownerName": "Alejandra",
          "targetRoute": "/analisis/ana_01J9Y8C3N6/visualizacion"
        }
      ]
    },
    "peerNews": {
      "status": "ok",
      "data": [
        {
          "id": "nws_01J9Y9A1B2",
          "companyId": "cmp_shell",
          "companyName": "Shell",
          "colorKey": "shell",
          "initials": "SH",
          "impact": "up",
          "headline": "Reporta mejora de margen EBITDA sectorial.",
          "source": "Bloomberg"
        }
      ]
    },
    "marketIndicators": {
      "status": "ok",
      "data": [
        {
          "id": "brent",
          "label": "Brent",
          "value": 71.4,
           "unit": "usd_b",
          "deltaPct": 0.6,
          "trend": "up"
        },
        {
          "id": "trm",
          "label": "TRM",
          "value": 4102,
          "unit": "cop_per_usd",
          "deltaPct": 0.2,
          "trend": "up"
        }
      ]
    },
    "permissions": { "canViewAnalysisList": true }
  }
  ```
   A failed section is `{ "status": "error", "errorCode": "<CODE>" }`; a hidden one is
   `{ "status": "forbidden" }`.
- Raw vs derived:
  - Front formats (es-CO, CF-70): `executiveSummary` integers as plain integers; `avgCoveragePct` (0–100) → `82 %`;
    `updatedAt` (ISO) → relative "hace 3 días" / "hoy"; `marketIndicators[].value` + `unit` → e.g. `71,4 USD/B`
         (`usd_b`), `$ 4.102` (`cop_per_usd`), `46,1 USD bn` (`usd_bn`), `$ 1.935` (`cop`); `deltaPct` → signed `+0,6 %`.
  - BFF derives: the five counts and the average coverage; `status` (enum `draft | in_progress | in_review | published` → i18n
    chip label); `targetRoute` per role and status (Visualización / Resultados / Definición, SCR-05 Interactions; consumers
    always Visualización); `trend` (`up | down` from the sign of `deltaPct`, CF-71: TRM +0.2 must be `up`); `initials`,
    `colorKey` (company colour map §2.7, CF-47); `impact` (`up | down`); the news filter (only peers of the user's default
    analysis); the banner text (AI suggestion, `aiStatus:'suggestion'`, CF-40).
- Sections (each an independent `SectionResult`; the page never fails as a whole):
  - `banner`: on error or forbidden the banner is hidden [inference].
  - `executiveSummary`: on error, a section error with retry. Counts render `0`, never hidden.
  - `enabledAnalyses`: on error, a section error. An empty list shows the header plus a muted note (copy pending, SCR-05).
  - `peerNews`: an empty list shows "Sin noticias recientes para los pares configurados." (HTML L336–338); errors are
    section-scoped.
  - `marketIndicators`: errors are section-scoped (external market provider).
- Permissions: `canViewAnalysisList` shows "Ver todos ›" (false for executive_viewer). Enabled analyses are pre-filtered by
  role (§1.19: analyst all incl. drafts; explorers published; executive_integral published + invited previews;
  executive_viewer only those reachable through presentations).
- budgetBytes: 12288
- Commands used: none (read-only screen). Yarbis panel data comes from V-46 with `screen=inicio`.
