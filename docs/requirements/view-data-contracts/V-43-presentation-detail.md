<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-43-presentation-detail.md · copied 2026-09-25 -->

# V-43 — Presentation detail

- Endpoint: `GET /api/v1/views/presentation-detail/:presentationId` — SCR-14 viewer frame.
- Screens: SCR-14 (back link, title, "Editar" / "Descargar" / "Compartir", stage + pager, "Comentarios de otros usuarios");
  the slides themselves come from V-42 (`slideRef`), the comment list from V-26.
- Params:
  - `presentationId` (path, `PresentationId`). The current slide (`?slide=n`) is client state and is not sent.
- Response (minimal JSON):

```json
{
  "meta": {
    "id": "prs_directorio_t4",
    "name": "Directorio Ejecutivo T4",
    "templateId": "directorio",
    "templateName": "Directorio Ejecutivo",
    "status": "published",
    "createdOn": "2025-10-02",
    "publishedOn": "2025-10-05",
    "hasUploadedVersion": false
  },
  "accentKey": "template.directorio",
  "slideRef": { "view": "V-42", "path": "/api/v1/views/presentation-slides/prs_directorio_t4", "slideCount": 7 },
  "comments": { "count": 2 },
  "permissions": { "canEdit": false, "canDownload": true, "canComment": true }
}
```

- Raw vs derived:
  - Raw: `name`, `createdOn`, `publishedOn`, `templateId`.
  - Derived by the BFF: `templateName`, `accentKey` (directorio `#672DBD`, storytelling `#49BCD8`, analitico `#47A4D5`),
    `status`, `hasUploadedVersion` ("Descargar" then delivers the uploaded PPT), `slideRef.slideCount` (drives the pager dots
    before V-42 resolves), `comments.count`, `permissions` (visibility: published, or own draft for the analyst — else `403` /
    `404`).
  - Front-only: title typography, dots, `?slide=` clamping.
- Sections: `meta` (primary datum; failure → `ApiError`, SCR-17), with the slides (V-42) and comments (V-26) loaded as
  independent sections of the screen.
- Permissions: `canEdit` ("Editar" → builder; analyst), `canDownload` ("Descargar" → OVL-07b), `canComment` (composer;
  analyst and executive_integral — hidden for executive_viewer and explorers, §1.19 / CF-39).
- budgetBytes: 2048
- Commands used: `C-10 POST /api/v1/review-comments` (`entityType: presentation`), `C-14 POST /api/v1/exports`
  (`presentation-pptx | presentation-pdf`).
