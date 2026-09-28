# ADR-0002: Contract publication — Zod → OpenAPI 3.1, versioned tarball, vendored and pinned by the web

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L22 (each repo self-sufficient, no relative paths to the other), L24 (contract is the
  only boundary), L90–102 (§2.2 consumer-driven contract and synchronisation), L264 (`contracts/openapi.yaml` generated and
  published), L277–279 (contract v1), L533 (BFF pipeline publishes the contract when the version changes).
  Plan: `.plan/PLAN.md` L42 (decision D4).

## Context

The web and the BFF are separate repositories that meet only at the HTTP contract (brief L24). The BFF owns the
specification: Zod schemas in `src/contracts/` generate OpenAPI 3.1 in `contracts/openapi.yaml`, versioned by SemVer in
`info.version` (L93). The pipeline must publish it as a versioned artifact — a private npm package `@eco/bff-contract` on
Azure Artifacts / GitHub Packages, or a release with `openapi.yaml` attached — decided by ADR in both repos (L94). The web
generates its types, Zod validators and client from that specification and pins the exact version (L95–96). CI on both sides
must detect drift: the BFF fails if `openapi.yaml` is stale or a breaking change lands without a major bump (L99); the web's
`contract:check` regenerates from the pinned version and fails on uncommitted differences (L100). Pact is "optional,
recommended (ADR)" (L101). Breaking changes require a major and `/api/v1` + `/api/v2` coexistence (L102).

Constraints today: there is no Git remote and no package registry yet; both repos live as siblings on one machine, which
makes a `../eco-comparator-bff/contracts/openapi.yaml` path tempting and explicitly forbidden (L22).

## Decision

1. **Source of truth:** Zod schemas in `src/contracts/<view>/` (responses `.strict()`), registered with
   `@asteasolutions/zod-to-openapi`; `pnpm contract:build` writes `contracts/openapi.yaml` (OpenAPI 3.1, committed).
2. **Versioning:** `info.version` is SemVer and is the contract version (independent of the BFF app version). New optional
   field / new endpoint → minor; remove, rename or retype → major, served under a new `/api/vN` prefix alongside the old one
   (L102). Documentation-only changes → patch.
3. **Drift gates (BFF CI):** `pnpm contract:build && git diff --exit-code contracts/openapi.yaml` (stale spec fails), and
   `pnpm contract:diff` = `oasdiff breaking <last-released openapi.yaml> contracts/openapi.yaml --fail-on ERR`; a breaking
   result without a major bump fails the build.
4. **Artifact:** `pnpm contract:pack` produces `@eco/bff-contract-<x.y.z>.tgz` (an npm-format tarball: `package.json` with
   `name: "@eco/bff-contract"`, `version: x.y.z`, `openapi.yaml`, `CHANGELOG.md` excerpt) plus its `sha256`. It is attached to
   the BFF release/CI artifacts. **No registry yet.**
5. **Consumption (web):** the web vendors a copy under `vendor/contract/@eco/bff-contract-<x.y.z>.tgz` and pins it in
   `contract.lock.json` `{ "package": "@eco/bff-contract", "version": "x.y.z", "sha256": "<hex>" }`. `contract:generate`
   unpacks it and runs the generator (orval, per web ADR); `contract:check` verifies the hash, regenerates and fails on
   differences. Updating the contract is an explicit PR that replaces the tarball and the lock entry (L96).
6. **No cross-repo paths:** neither repo references the sibling folder in scripts, configs or tests; the only transfer is
   copying a released tarball (L22).
7. **Pact: deferred.** Not adopted in v1 (see Alternatives); revisit when a registry/broker exists or a second consumer
   appears (which by L299 would get its own BFF anyway).

## Alternatives considered

- **Private npm package on Azure Artifacts / GitHub Packages** (L94). The target shape once a remote exists; the tarball is
  already npm-format, so switching is `pnpm publish` plus changing the web's install source. Deferred only because no
  registry or credentials exist today.
- **GitHub/Azure release with raw `openapi.yaml` attached** (L94). Equivalent, but a bare YAML has no package metadata or
  changelog and invites hand edits; the tarball + sha256 gives integrity and the same upgrade path to a registry.
- **Relative path / git submodule / workspace link to the sibling repo.** Violates L22 (each repo clones, builds and deploys
  alone). Rejected.
- **Hand-written OpenAPI as source, Zod generated from it.** Duplicates the source of truth the brief assigns to Zod (L93,
  L212). Rejected.
- **Pact consumer-driven contract tests now** (L101). Needs a pact broker (or file exchange between repos) and a running
  provider verification step; with no remote, the exchange would reintroduce cross-repo file coupling. The needs are already
  covered: the web's requirements are captured in `view-data-contracts.md` (L92), responses are `.strict()`-validated in the
  BFF (L98), the web validates every response with generated Zod (L477), and the web E2E runs against the BFF mock image
  (L109, L523). Deferred, not rejected.

## Consequences

- Positive: one source of truth, reproducible generation, integrity-checked hand-over without a registry, mechanical
  breaking-change detection.
- Positive: moving to a registry later changes only the transport (publish/install), not the files or the gates.
- Negative: vendoring a binary tarball in the web repo (small, text inside) and a manual copy step per release.
- Negative: `oasdiff` needs the last released spec; the BFF keeps it as `contracts/released/openapi-<x.y.z>.yaml` (or reads
  it from the last release artifact) so the diff works offline.
- The web repo records the mirror decision in its own ADR (L94 "en ambos repos").
- Follow-ups: P2-B04 (contract scripts config), P3 contract v1.0.0 (L279).
