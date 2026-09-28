# @eco/bff-contract changelog

The published HTTP contract of the Eco-Comparador BFF: `contracts/openapi.yaml`, packed by `pnpm contract:pack` into
`dist-contract/eco-bff-contract-<version>.tgz` (+ `.sha256`). The version is `info.version` of the spec
(`CONTRACT_VERSION` in `tools/contract/build-openapi.ts`). Each release adds one `## <version>` entry at the top; the
tarball carries only the entry of its own version. Pre-1.0 releases may break; from 1.0.0 a breaking change (oasdiff
`pnpm contract:diff`) needs a new major.

## 0.2.0 — pre-release

98 operations (0.1.0 as last packed had 97). Additive: no operation was removed or narrowed.

- Added A-05 `POST /api/v1/auth/password-login` (operationId `passwordLogin`), the mock password login of the owner
  decision of 2026-09-28 (it overrides web CF-29 for the mock only; the production target stays OIDC, A-01/A-02).
  - Request (strict): `username` (e-mail, trimmed, at most 254 characters), `password` (1..128 characters).
  - 200: the session cookie and CSRF token are set as after A-02, and the body is the A-04 session
    (`A05Response` has the same shape as `A04Response`, `csrfToken` included).
  - 401 `INVALID_CREDENTIALS` (common ApiError, one generic message for a wrong password and an unknown user);
    400 `BAD_REQUEST` for a malformed body. Public: no session and no CSRF token; the rate limit applies.
- C-33 `sendAssistantMessage`: the documented SSE event schema (`C33Response`) is the CF-111 union
  `token { content } | citation { content } | done { messageId } | error { errorCode }`, the events the mock streams.
  It replaces the single `{ type, content }` event; the last 0.1.0 pack already carried the union, which its changelog
  entry never stated.

## 0.1.0 — pre-release

Partial contract, published so the web lane can prove vendoring, the sha256 lock, orval generation and
`contract:check` (P3-13) before 1.0.0. Not every screen is covered yet: do not generate the full client from it.

Covered (48 operations, one per registry entry in `src/contracts/registry.ts`):

- Views: V-03 (home), V-04..V-08 (analyses, definition wizard, competitor / indicator catalogues, validation),
  V-09..V-14 (results header, company coverage, peer average and company comparisons, report summary, AI findings).
- Commands: C-01..C-36 (analysis drafts and generation, companies, value / weight overrides, recalculations,
  publication, review comments, change requests, exports, executive narratives, KVI targets, value monitor
  configuration and KVIs, saved views, sensitivities, weight simulation, strategic plans, presentations, slide comment
  drafts, assistant messages and feedback, notifications read state).
- Shared: `ApiError` body for every 4XX / 5XX, `SectionResult` sections, canonical unit codes
  (docs/requirements/unit-codes.md).

Still missing (later rows before 1.0.0):

- Auth and session: A-01..A-04.
- Views: V-01, V-02, V-15..V-47 (shell status, admin home, TBG / ILP modules, visualisation, detail, sensitivities,
  value monitor, presentations, notifications, settings, assistant context, saved views).
- Commands: C-37..C-41 (user settings, comparison profiles, invitation preview).
- Operations: O-01..O-04 (operation status and events, file download, readiness).
- Query parameters of V-04..V-14 (filters, paging, horizon), in progress as P3-04q; today those operations declare
  only their path parameters.
