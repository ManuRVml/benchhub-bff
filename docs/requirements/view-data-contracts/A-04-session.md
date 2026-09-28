<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/A-04-session.md · copied 2026-09-25 -->

# A-04 — Session (user, role, navigation, global permissions)

- Endpoint: `GET /api/v1/session`
  First SPA call after landing and after every reload; `401` means no session (the SPA goes to
  `/login?returnTo=<current>&error=session_expired`). `Cache-Control: no-store`.
- Screens: SCR-04 App shell (sidebar items and locks, header avatar/name/role, Yarbis FAB visibility, analysis tab bar),
  SCR-02 Access gate (guard + one-time redirect), SCR-03 Admin (guard), SCR-05 Inicio ("Ver todos ›" visibility), every route
  guard (SCR-17 `/403`).
- Params: none.
- Response (minimal JSON):
  ```json
  {
    "user": {
      "id": "usr_01J9Y7C2QK",
      "displayName": "Camila Bravo",
      "avatarFileId": "fil_01J9Y7C4AV",
      "roleLabelKey": "role.analystCreator"
    },
    "role": "analyst_creator",
    "hasAdminAccess": false,
    "requiresGate": false,
    "navigation": [
      {
        "id": "inicio",
        "labelKey": "nav.inicio",
        "to": "/inicio",
        "isLocked": false
      },
      {
        "id": "ref-tbg-ilp",
        "labelKey": "nav.refTbgIlp",
        "to": "/analisis?ref=tbg-ilp",
        "isLocked": false
      },
      {
        "id": "ref-competitivo",
        "labelKey": "nav.refCompetitivo",
        "to": "/analisis/ana_01J9Y8D4T2/resultados",
        "isLocked": false
      },
      {
        "id": "monitor-valor",
        "labelKey": "nav.monitorValor",
        "to": "/monitor-valor",
        "isLocked": false
      },
      {
        "id": "presentaciones",
        "labelKey": "nav.presentaciones",
        "to": "/presentaciones",
        "isLocked": false
      },
      {
        "id": "notificaciones",
        "labelKey": "nav.notificaciones",
        "to": "/notificaciones",
        "isLocked": false
      }
    ],
    "analysisContext": { "defaultAnalysisId": "ana_01J9Y8D4T2" },
    "permissions": {
      "canUseAssistant": true,
      "canCreateAnalysis": true,
      "canViewAnalysisList": true,
      "canUseAnalysisTabs": true
    }
  }
  ```
- Raw vs derived:
  - Everything is derived by the BFF from the Entra identity and group mapping: `role`, `hasAdminAccess`, `requiresGate`
    (true only on the first session call after the callback, and only with `hasAdminAccess`), `navigation[].isLocked` and
    `navigation[].to`. The front never derives locks or targets (SCR-04). Examples: Ref. Competitivo goes to Resultados for
    the analyst and to Visualización for consumers; the Presentaciones lock follows §1.19.
  - The front formats `displayName` as is and resolves `labelKey` / `roleLabelKey` with i18n ("Analista creador", …).
    SCR-04 lists `roleLabel` (a string). A key keeps the Spanish copy in the front's i18n.
  - `avatarFileId` is fetched through O-03 (`disposition=inline`); a missing avatar shows initials [inference].
  - The unread badge is NOT here: it comes from V-01 (independent, refreshable).
- Sections: single object. The session is the primary datum: if it fails, the whole app fails (`401` → SCR-01; `5xx` → a
  full-page error with retry). No `SectionResult`.
- Permissions: `ActionPermissions` global flags used by the shell and guards:
  - `canUseAssistant`: FAB and panel (CF-40; analyst_creator and executive_integral).
  - `canCreateAnalysis`: "+ Crear nuevo análisis" (analyst_creator).
  - `canViewAnalysisList`: "Ver todos ›" and the Ref. TBG I ILP route (false for executive_viewer).
  - `canUseAnalysisTabs`: the "Configuración / Resultados / Presentación" tab bar (analyst_creator).
- budgetBytes: 4096
- Commands used: A-03 (Salir / Cerrar sesión); O-03 (avatar image).
