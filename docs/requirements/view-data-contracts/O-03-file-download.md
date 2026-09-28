<!-- origin: eco-comparator-web@12dbc78 docs/design/view-data-contracts/O-03-file-download.md · copied 2026-09-25 -->

# O-03 — Mediated file download

- Endpoint: `GET /api/v1/files/:fileId/download?disposition=attachment`
  Permission-checked streaming of a file kept in UC Volumes / ADLS (brief §4.1 rule 12). Sets `Content-Type`,
  `Content-Disposition` (with the display file name) and `Content-Length`. The response never contains a storage path,
  volume name or signed URL.
- Screens: SCR-04 header avatar (`A-04 user.avatarFileId`, inline image); SCR-08 "Excel" export result; SCR-11 "Descargar";
  SCR-13 OVL-07b "Descargar presentación" (done step) and the uploaded PPT version; SCR-14 "Descargar".
- Params:
  - `fileId` (path, branded `fil_…`, taken from O-01 `result.fileId`, A-04 or a view field).
  - `disposition` (query, `attachment` default | `inline` for images and the avatar).
  - Not in the SPA URL: downloads are browser navigations or `<img src>`.
- Response (minimal JSON): success is the binary stream (no JSON). Error body for a foreign or expired file (`403` / `404`):
  ```json
  {
    "code": "FILE_NOT_FOUND",
    "message": "…",
    "traceId": "01J9ZN2H5K8M1P4Q7S0TVW3XYZ"
  }
  ```
- Raw vs derived: none. The file name, type and size are set by the BFF headers; the front shows the name from the view
  or operation payload.
- Sections: n/a.
- Permissions: the BFF checks that the user may read the owning entity (analysis, presentation, export operation, own avatar)
  before it streams. Foreign files get `403`; unknown or expired ones get `404`. No action flags.
- budgetBytes: 512 (JSON error body only; file size limits are per product, e.g. PPT ≤ 50 MB in C-30)
- Commands used: none (files are produced by C-14 exports and C-30 uploads).
