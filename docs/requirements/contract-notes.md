# Contract notes

Divergences found while turning the web's view-data contracts (`docs/requirements/view-data-contracts/`, copied from
web `docs/design/view-data-contracts/`) into the Zod registry (`src/contracts/registry.ts`) and `contracts/openapi.yaml`.
Each entry names the contract, the lines that disagree, the decision the BFF implements and the web conflict (CF) id
that records it in web `docs/design/conflicts.md`. A divergence is closed only when the web resolves it; the BFF copy of
the contract is then re-synced from that web commit.

| Contract | Source line | Divergence | Decision (BFF) | Web CF | Status |
| -------- | ----------- | ---------- | -------------- | ------ | ------ |
| V-03 | V-03-home.md L85 (before web d4c7ea2: error prose) vs brief `prompt_Start_Eco.md` L278 | V-03 prose described a failed section as `{ "status": "error", "error": { "code", "messageKey", "traceId" } }`; the brief's `SectionResult<T>` is `{ status: 'error'; errorCode: string }` | The brief wins: `sectionResult()` (`src/contracts/common/section-result.ts`) emits `{ "status": "error", "errorCode": "<CODE>" }`; the per-request `traceId` travels in the logs and in `ApiError` bodies, never inside a section | CF-95 | RESOLVED on web d4c7ea2 (V-03 prose now shows the brief's shape) |
| V-03 | V-03-home.md L68 (example `"unit"`) and L90 (prose) vs V-12, V-24 examples | V-03 spelled US dollars per barrel `usd_per_bbl`, while V-12 and V-24 use `usd_b`; V-03 also uses `usd_bn` for billions of US dollars | `UnitCodeSchema` (`src/contracts/common/units.ts`) is exactly the canonical list of `docs/requirements/unit-codes.md` (copied from web d4c7ea2 `docs/design/unit-codes.md`): `usd_b` = USD per barrel (`71,4 USD/B`), `usd_bn` = billions of USD (`46,1 USD bn`); `usd_per_bbl` is dropped | CF-96 | RESOLVED on web d4c7ea2 (V-03 and V-07 now say `usd_b`) |

## Canonical unit codes

`percent`, `points`, `ratio_x`, `rating`, `kboe`, `usd_b`, `usd_bn`, `cop_per_usd`, `bcop`, `mmcop`, `cop` — web
d4c7ea2 `docs/design/unit-codes.md` (BFF copy: `docs/requirements/unit-codes.md`), in that order. A new unit is added on the
web first, re-synced into `docs/requirements/unit-codes.md`, then added to `UNIT_CODES`.

## OpenAPI generation notes

- `ApiError.details` is `z.json()` in the runtime contract; zod-to-openapi 9.1.0 cannot walk that recursive schema, so
  `tools/contract/build-openapi.ts` publishes it as an unconstrained schema (any JSON value). The wire shape is the same.
- `info.version` is `CONTRACT_VERSION` in `tools/contract/build-openapi.ts` (0.1.0 while the contract is in
  development; the brief publishes v1.0.0 at contract freeze). Bump it on every contract change, major on a break;
  `pnpm contract:diff BASE REVISION` (oasdiff `breaking --fail-on ERR`) tells which.
