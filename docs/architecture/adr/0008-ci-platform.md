# ADR-0008: CI platform — GitHub Actions by default, container engine via `${CONTAINER_ENGINE:-podman}`

- Status: Accepted
- Date: 2026-09-25
- Deciders: architect (BFF lane), P2-B06
- Brief references: `prompt_Start_Eco.md` L532–535 (pipeline per repo on GitHub Actions or Azure DevOps, ADR; BFF steps
  `verify` → API E2E → generate/diff OpenAPI → publish contract if the version changed → publish Docker image (normal and
  `-mock`); web steps; deploy pipeline), L530 (scripts), L109 and L523 (BFF mock image for the web E2E), L267
  (`Dockerfile` with a mock target), L94 (contract publication target). Plan: `.plan/PLAN.md` L43 (decision D5: container
  engine).

## Context

The brief leaves the CI platform open between GitHub Actions and Azure DevOps (L532). Neither repository has a remote yet,
so no platform is imposed by existing infrastructure. The machine that builds today has **podman 5.8.3 and no docker** (plan
D5), and every script or test that builds or runs a container must use `${CONTAINER_ENGINE:-podman}`. The BFF pipeline order
is fixed by L533.

## Decision

1. **Platform: GitHub Actions** as the default. Workflows live in `.github/workflows/` of this repo; they only call `pnpm`
   scripts, so the logic stays in `package.json` and is platform-neutral.
2. **BFF pipeline (`ci.yml`, on PR and `main`)**, in the order of L533:
   1. `pnpm install --frozen-lockfile`
   2. `pnpm verify` (lint, format check, typecheck, unit tests, `check:architecture`)
   3. API E2E (`pnpm test:e2e`, Vitest + Supertest against `createApp(container)` with mocks)
   4. `pnpm contract:build` + `git diff --exit-code contracts/openapi.yaml` + `pnpm contract:diff` (oasdiff, ADR-0002)
   5. On `main` when `info.version` changed: `pnpm contract:pack` and attach `@eco/bff-contract-<x.y.z>.tgz` + sha256 to a
      release (ADR-0002)
   6. Build and publish images `eco-comparator-bff:<version>` and `eco-comparator-bff:<version>-mock` (Dockerfile targets
      `runtime` and `mock`, L267) to the chosen registry.
   A separate `deploy.yml` (manual/tag trigger) runs ADR-0007: fetch the pinned web `dist`, verify sha256, package with
   `app.yaml`, deploy with the Databricks CLI (`databricks apps deploy`) using a Service Principal from repo secrets.
3. **Container engine:** every script that builds or runs images uses `${CONTAINER_ENGINE:-podman}` (e.g.
   `"$CONTAINER_ENGINE" build --target mock -t eco-comparator-bff:$VERSION-mock .`), never a hard-coded `docker`. Hosted
   `ubuntu-latest` runners include podman; a runner may set `CONTAINER_ENGINE=docker` explicitly. The `Dockerfile` stays
   OCI-standard (no BuildKit-only syntax) so both engines build it.
4. **Secrets and permissions:** workflows use `permissions:` least privilege; Databricks and registry credentials are
   environment secrets on a protected `production` environment; no secret is echoed (ADR-0006 redaction also covers CI logs
   of the app).

## Alternatives considered

- **Azure DevOps Pipelines.** A natural fit for an Ecopetrol/Azure estate (Azure Artifacts for the contract package, L94).
  Switching later requires: (a) an `azure-pipelines.yml` per repo with the same stage order calling the same `pnpm` scripts;
  (b) moving secrets to a variable group / Key Vault-linked library and a Databricks service connection; (c) replacing the
  release-asset step with Azure Artifacts `universal publish` or `npm publish` to an Azure Artifacts feed (ADR-0002 already
  produces an npm-format tarball); (d) an image registry (ACR) service connection; (e) choosing Microsoft-hosted
  `ubuntu-latest` (podman available) or a self-hosted agent with podman. Estimated effort: one pipeline file per repo plus
  service connections; no script changes, because all logic lives in `pnpm` scripts. Not chosen now because no Azure DevOps
  organisation or project has been provided.
- **Local-only scripts (no hosted CI) until a remote exists.** The `pnpm verify` chain runs locally anyway; the workflow file
  costs nothing and is ready when the remote is created. Rejected as the long-term choice.
- **Hard-coding `docker`.** Fails on the current build machine (plan D5). Rejected.

## Consequences

- Positive: the pipeline is defined now and runs as soon as a GitHub remote exists; switching to Azure DevOps is a
  pipeline-file translation, not a rewrite.
- Positive: container builds work on podman and docker without script changes.
- Negative: until a remote exists, CI is exercised only locally (`pnpm verify`); the workflow YAML is validated with
  `actionlint` when it is added.
- Negative: the web repo must record its own CI ADR consistent with this one (web pipeline steps L534).
- Follow-ups: P2-B05 (container scripts with `${CONTAINER_ENGINE:-podman}`), P6 (workflow files, deploy job).
