# Contract workflow

How the HTTP contract between this BFF and the web is written, generated, checked, versioned, published and consumed. It
describes the repository as it is; items that do not exist yet are marked **planned**. The decision behind it is
[ADR-0002](adr/0002-contract-publication.md) (contract publication); the work plan is `.plan/BFF-P3.md` (BFF-P3 v0.2,
outside this repository).

## 1. Sources of truth

- **Requirements, copied from the web.** The web owns the screen-level contracts. `docs/requirements/` holds copies:
  `view-data-contracts/<ID>-<slug>.md` (one file per A-/V-/C-/O- id), `view-data-contracts.md` (index),
  `unit-codes.md` (canonical unit codes) and `contract-notes.md` (divergence log, see §6). Each copied file starts with
  an origin line such as `<!-- origin: eco-comparator-web@<sha> docs/design/view-data-contracts/V-03-home.md · copied
  <date> -->`. The copies are re-synced from a web commit by a dedicated task (P2-B07, P2-B07b, …); they are never
  edited by hand in this repository.
- **Zod schemas are the contract.** `src/contracts/<area>/<id>-<slug>.ts` hold the request / response schemas
  (`.strict()` objects, branded ids from `src/contracts/common/ids.ts`, units from `src/contracts/common/units.ts`,
  independently loaded sections wrapped in `sectionResult(...)`, permissions as `ActionPermissionsSchema`).
  `src/contracts/registry.ts` (`CONTRACT_SCHEMAS`) maps every contract id to its schemas and endpoint metadata.
  `contracts/openapi.yaml` is generated from the registry (§3) and committed; nobody edits it by hand.
- **Examples.** `tests/contract-examples/` holds the JSON examples extracted from the requirement files, one per block
  (`<ID>.request.json`, `<ID>.response.json`, `<ID>.fragment.<n>.json`), plus the manifest `index.json`
  (`{ id, kind, form, file, sections }`, sorted by id, kind, file). An example whose values are placeholders
  (`branded-id`, `optional-…`, `<…>`, `a|b|c`) has `form: "descriptor"`; the schema row that implements the id adds a
  hand-written concrete instance next to it, `<ID>.<kind>.instance.json`, and that instance is what the tests use. The
  extractor never deletes `*.instance.json` files.

## 2. Adding or changing a contract schema

1. Read the requirement file: the Request / Response JSON blocks, `- Endpoint:`, `- Params:`, "Raw vs derived",
   "Sections" and "Permissions".
2. Write or edit `src/contracts/<area>/<id>-<slug>.ts`. No `z.any`, `z.unknown`, `.passthrough` or `.catchall`. A new
   kind of id is one line in `common/ids.ts`; a new unit goes to the web's unit list first (see `contract-notes.md`).
3. Add or update the registry entry in `src/contracts/registry.ts`:
   `{ endpoint: { method, path }, operationId, request?, response, sections? }`. The path comes from the `- Endpoint:`
   line with express params kept as `:param`; `operationId` is camelCase verb + noun (`getHomeView`, `createAnalysisDraft`).
   For a GET or DELETE, query parameters listed under `- Params:` (or in the endpoint's query string) are registered as
   `request: z.object({...}).strict()`: `contract:build` publishes a GET/DELETE request as query parameters, never as a
   body. Query values arrive as strings, so numbers use `z.coerce` and documented defaults use `.default()`; path params are
   not part of it.
4. For a descriptor example, write `tests/contract-examples/<ID>.<kind>.instance.json`.
5. Run `pnpm verify`. The generic test `tests/unit/contracts/registry.contract.test.ts` is driven by the manifest:
   - every registry id must have at least one example;
   - every request / response example round-trips strictly (`tests/helpers/expect-strict-round-trip.ts`: parse output
     equals the input, and the example plus an extra key is rejected); a fragment is checked against the strict partial of
     the response;
   - every section in the manifest or in the registry `sections` must also accept the `error` and `forbidden`
     `SectionResult` variants (`tests/helpers/expect-section-variants.ts`);
   - `tests/unit/contracts/required-fields.test.ts` removes each required top-level key from each request example and
     expects the request schema to reject it.
   Rules the examples do not exercise (enum domains, ranges, refinements) get their own tests in `tests/unit/contracts/`.
6. Run `pnpm contract:build` and commit the regenerated `contracts/openapi.yaml` with the schema change (§3).
7. Record every divergence between example and prose (§6).

## 3. Generating and checking

- `pnpm contract:examples` (`tools/contract/extract-examples.mjs`) rewrites `tests/contract-examples/` from
  `docs/requirements/view-data-contracts/*.md`. It is reproducible: `pnpm contract:examples && git diff --exit-code
  tests/contract-examples` must be clean on a committed tree.
- `pnpm contract:build` (`tools/contract/build-openapi.ts`) writes `contracts/openapi.yaml` (OpenAPI 3.1) from the
  registry: one operation per entry (method, path, operationId, summary = the H1 of the requirement file), the request as
  query parameters for GET/DELETE and as a JSON body otherwise, the 200 response, and the shared `ApiError` body for
  4XX / 5XX. The output depends only on the registry, so rebuilding an unchanged registry is byte-identical; a stale
  committed spec is a failure (`pnpm contract:build && git diff --exit-code contracts/openapi.yaml`).
  `pnpm exec tsx tools/contract/list-registry.ts` prints the registry summary (endpoint, operationId, request / response
  flags, sections) used by the acceptance checks.
- `pnpm contract:diff BASE REVISION` (`tools/contract/diff.mjs`) is the breaking-change gate: it runs
  `oasdiff breaking BASE REVISION --fail-on ERR` in a container (`${CONTAINER_ENGINE:-podman}`, pinned image
  `tufin/oasdiff:v1.32.1`, overridable with `OASDIFF_IMAGE`), both files mounted read-only, and exits with oasdiff's code.
  Keeping the last released spec as `contracts/released/openapi-<x.y.z>.yaml` so the diff runs offline is **planned**
  (ADR-0002 Consequences); today BASE is passed explicitly.
- Running these gates in CI is **planned** (ADR-0008 CI platform); today they run locally and in the task acceptance
  checks.

## 4. Versioning and publishing

- The contract version is `info.version` of `contracts/openapi.yaml`, set from `CONTRACT_VERSION` in
  `tools/contract/build-openapi.ts` (currently `0.1.0`, a pre-release). It is independent of the BFF application version.
- SemVer rules (ADR-0002 §Decision 2): a new optional field or a new endpoint is a minor; removing, renaming or retyping
  anything is a major, served under a new `/api/vN` prefix next to the old one; documentation-only changes are a patch.
  Pre-1.0 releases may break; from 1.0.0 a breaking result of `pnpm contract:diff` needs a new major.
- `CHANGELOG.md` gets one `## <version>` entry at the top per release.
- `pnpm contract:pack` (`tools/contract/pack.mjs`) writes `dist-contract/eco-bff-contract-<version>.tgz`, an npm-format
  tarball with `package/package.json` (`@eco/bff-contract`, that version, no scripts or dependencies),
  `package/openapi.yaml` (byte for byte) and `package/CHANGELOG.md` (only the entry of that version), plus
  `eco-bff-contract-<version>.tgz.sha256` in `sha256sum` format. The tarball is reproducible (sorted entries, fixed
  modes, owners and mtime, gzip OS byte pinned), so the same inputs give the same sha256. `dist-contract/` is
  git-ignored: the tarball is a release artifact, handed to the web lane with its sha256.
- Publishing to a package registry (Azure Artifacts / GitHub Packages) is **planned**; there is no registry yet, and the
  hand-over is a copy of the tarball plus its hash.

## 5. Consumption by the web

The web repository never reads this repository's folders (brief L22); it only receives released tarballs (its mirror
decision is web ADR-0004).

- The web vendors the tarball under `vendor/contract/@eco/bff-contract-<version>.tgz` and pins it in
  `contract.lock.json`: `{ "package": "@eco/bff-contract", "version": "<version>", "sha256": "<hex>" }` (today version
  `0.1.0`).
- `pnpm contract:generate` (web) verifies the tarball's sha256 against the lock, unpacks it and runs Orval into
  `src/shared/api/generated/` (TypeScript types and Zod schemas; gitignored).
- `pnpm contract:check` (web) is the drift gate: it fails when the tarball's sha256 differs from the lock, when two fresh
  generations differ, or when `src/shared/api/generated/` differs from a fresh generation.
- Updating the contract on the web is an explicit change that replaces the vendored tarball and the lock entry together.

## 6. Divergences between example and prose

A requirement file can contradict itself: its JSON example says one thing and its prose another. The BFF-P3 rule
(`.plan/BFF-P3.md` v0.2, rule 4) decides: **the example wins for field names and presence; the prose wins for enum and
nullable domains.** A divergence is never fixed silently on one side:

- the schema row lists every divergence it hit (contract id, line, what differs, what it chose) in its task reply, and
  the orchestrator raises it with the web as a conflict (CF) / open question in the same cycle;
- `docs/requirements/contract-notes.md` records each divergence with its source lines, the decision the BFF implements,
  the web CF id and its status; an entry is closed only when the web resolves it and the requirement copies are re-synced
  from that web commit (§1), after which the affected schemas are updated by their own task.
