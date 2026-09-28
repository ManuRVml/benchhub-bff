<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-25-company-profile.md · copied 2026-09-25 -->

# V-25 — Company profile (OVL-13)

- Endpoint: `GET /api/v1/views/company-profile/:companyId`
  Profile card of one company plus its recent news. Cached with a TTL, `ETag` + `Cache-Control: private, max-age=300`
  [inference].
- Screens: OVL-13 company profile modal (420px), opened from any company name or "i": SCR-07 step 2 tiles, SCR-08 coverage
  cards and comparison rows, SCR-09 heatmap / composition names, SCR-10 chart company names, SCR-05 news cards
  [inference: P5-38 trigger list].
- Params: `companyId` (path, branded `cmp_…`). The modal is not in the SPA URL (transient overlay) [inference].
- Response (minimal JSON):
  ```json
  {
    "company": {
      "id": "cmp_chevron",
      "name": "Chevron",
      "colorKey": "chevron"
    },
    "country": "Estados Unidos",
    "category": "Super Major",
    "business": "Integrado global",
    "segments": ["Upstream", "Downstream", "Chemicals"],
    "news": [
      {
        "id": "nws_01J9Y9C3D4",
        "headline": "Producción récord en el Pérmico impulsa el flujo de caja.",
        "impact": "up"
      }
    ],
    "permissions": {}
  }
  ```
- Raw vs derived:
  - Front formats: `segments[]` joined with ", " (V2 shows one string "Upstream, Downstream, Chemicals", HTML L3506);
    `impact` → left border colour (`up` `#10B981`, `down` `#EF4444`, HTML L3982).
  - BFF derives: the news filter (news of this company only, newest first, max 3 [inference]) and `impact`. When the profile
    is unknown, the BFF returns `country: null`, `category: null`, `business: null`, `segments: []`; the front shows "—" and the
    V2 fallbacks "Par sectorial" / "Compañía de energía" (HTML L3981).
- Sections:
  - `company` + attributes: primary; on failure the modal shows an error with retry.
  - `news`: embedded list; an empty list shows the "Noticias recientes" title with an empty-state line [inference: copy
    pending]. The news provider may fail alone → `news: null` and a muted inline error [inference].
- Permissions: any authenticated user who can see a screen that shows the company. No action flags (empty
  `ActionPermissions`).
- budgetBytes: 2048
- Commands used: none.
