<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-45-user-settings.md · copied 2026-09-25 -->

# V-45 — User settings

- Endpoint: `GET /api/v1/views/user-settings` — SCR-16 "Configuración".
- Screens: SCR-16 (profile card with role label and area, "Accesibilidad": "Tamaño de fuente" A- / A / A+ and "Alto contraste"
  toggle, "Notificaciones por correo" toggle).
- Params: none (current user from the session).
- Response (minimal JSON):

```json
{
  "profile": { "displayName": "Camila Bravo", "roleLabel": "Analista creador", "area": "VP Tecnología e Innovación" },
  "accessibility": { "fontScale": 1, "fontScaleOptions": [0.9, 1, 1.1], "highContrast": false },
  "emailNotifications": true,
  "permissions": {}
}
```

- Raw vs derived:
  - Raw: `displayName`, `area` (V2 static "VP Tecnología e Innovación", HTML L2996), stored preferences `fontScale`,
    `highContrast`, `emailNotifications`.
  - Derived by the BFF: `roleLabel` (from the resolved role, §1.19), `fontScaleOptions` (OQ-20 default 0.9 / 1 / 1.1 for A- /
    A / A+).
  - Front-only: applying the font scale and the high-contrast token set (ADR, OQ-20) to the app; email preference is stored
    only (no email backend in v1, OQ-20).
  - Note: SCR-16's inventory names the endpoint `GET /api/v1/users/me/preferences` with steps 0.875 / 1 / 1.125; this contract
    follows synthesis §4.2 (`/views/user-settings`) and OQ-20 (0.9 / 1 / 1.1).
- Sections: single `SectionResult`.
- Permissions: none (every role edits its own settings; empty `permissions` object).
- budgetBytes: 1024
- Commands used: `C-37 PATCH /api/v1/user-settings` (accessibility + email preferences).
