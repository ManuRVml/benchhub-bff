<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/V-26-comment-thread.md · copied 2026-09-25 -->

# V-26 — Comment thread (F32 comments, F33 change requests)

- Endpoint: `GET /api/v1/views/comment-thread?entityType=&entityId=&page=1`
  The review thread attached to one entity: top-level comments and change requests with their replies. Shared by every
  screen that hosts `Cmp:CommentThread`. `Cache-Control: no-store` (collaborative, refetched after each command).
- Screens: SCR-09 Visualización comments rail; SCR-10 Detalle de indicador "Comentarios"; SCR-11 Monitor comments; SCR-13
  builder / presentation comments; SCR-14 viewer "Comentarios de otros usuarios"; OVL-04 comments drawer (not reachable in V2).
- Params:
  - `entityType` (query, enum `analysis | indicator | company | section | value_monitor | presentation`, required, CF-132).
  - `entityId` (query, branded id of that entity; for `indicator` it is the pair `ana_…:ind_…`, required).
  - `page` (query, default 1, page size 20 threads, newest activity first) [inference].
  - None of these are in the SPA URL; they come from the host screen's route.
- Response (minimal JSON):
  ```json
  {
    "items": [
      {
        "id": "cmt_01J9ZB1C2D",
        "kind": "comment",
        "author": {
          "name": "Alejandra Ríos",
          "roleLabelKey": "role.executiveIntegral"
        },
        "text": "¿Por qué la brecha con Shell se amplió tanto en el último trimestre?",
        "createdAt": "2026-09-23T09:10:00-05:00",
        "status": "in_analysis",
        "decision": null,
        "replies": [
          {
            "id": "cmt_01J9ZB1C2E",
            "author": {
              "name": "Camilo Vega",
              "roleLabelKey": "role.analystCreator"
            },
            "text": "Shell reportó una revisión al alza en su margen EBITDA; ya está reflejada en la fuente Capital IQ.",
            "createdAt": "2026-09-24T11:00:00-05:00"
          }
        ]
      },
      {
        "id": "chr_01J9ZB4F5G",
        "kind": "change_request",
        "author": {
          "name": "Alejandra Ríos",
          "roleLabelKey": "role.executiveIntegral"
        },
        "text": "Solicito ampliar el histórico a 3 años para este indicador.",
        "createdAt": "2026-09-25T08:00:00-05:00",
        "status": null,
        "decision": null,
        "replies": []
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalItems": 2,
    "permissions": {
      "canComment": true,
      "canReply": true,
      "canRequestChange": false,
      "canResolve": true
    }
  }
  ```
- Raw vs derived:
  - Front formats: `createdAt` (ISO) → relative es-CO "hace 2 días" / "ahora"; `roleLabelKey` → "Ejecutivo integral"; `status`
    → `Cmp:CommentStatusChip` `Pendiente` / `En análisis` / `Resuelto`; `kind: change_request` → `Solicitud de cambio` tag;
    `decision` → accepted / rejected label (M-05; copy pending, SCR-09/SCR-10).
  - BFF derives: `kind`; `status` (comments only, `pending | in_analysis | resolved`); `decision` (change requests only,
    `accepted | rejected | null`); ordering; author display data. No emails or user ids of other users are sent [inference:
    minimum disclosure]. In V2 the change-request example was written by an executive_viewer ("Jorge Salas", HTML L3606), which
    §1.19 forbids (SCR-10 A5). Here it is attributed to executive_integral.
- Sections: single primary datum inside the host screen. It is independent of the host view (e.g. V-24): a failure shows an
  error inside the comments card only (partial degradation, SCR-10 States).
- Permissions (resolved per role, §1.19 + CF-58):
  - `canComment` (composer): analyst_creator and executive_integral; explorers and executive_viewer false.
  - `canReply` ("Responder"): analyst_creator and executive_integral.
  - `canRequestChange` (`Solicitar ajuste`): executive_integral only.
  - `canResolve` (status chip and Aceptar / Rechazar, C-11 / C-13): analyst_creator only.
- budgetBytes: 16384
- Commands used:
  - C-10 `POST /api/v1/review-comments` `{entityType, entityId, text, parentId?}` (comment or reply, F32).
  - C-11 `PATCH /api/v1/review-comments/:commentId` `{status}` (analyst).
  - C-12 `POST /api/v1/change-requests` `{entityType, entityId, text, kind: data|scope|recalculation}` (F33).
  - C-13 `PATCH /api/v1/change-requests/:requestId` `{decision, note}` (analyst; `accepted` may trigger C-08 → O-01/O-02).
