# eco-comparator-bff images (brief L109, L267; ADR-0007, ADR-0008). Build with ${CONTAINER_ENGINE:-podman}:
#   podman build --target runtime -t eco-comparator-bff:<version> .
#   podman build --target mock    -t eco-comparator-bff:<version>-mock .
# Node matches .node-version; pnpm comes from package.json "packageManager" through corepack.
ARG NODE_IMAGE=docker.io/library/node:24.14.1-bookworm-slim

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
# Manifests only, so the dependency layers are cached until the lockfile changes. .pnpmfile.cjs rewrites the
# tooling packages' typescript dependency (docs/architecture/tech-stack.md) and must be present for --frozen-lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .pnpmfile.cjs ./

# Full install (dev dependencies included) + tsup bundle -> dist/main.js.
# --ignore-scripts: the only root lifecycle script is "prepare": "husky", which needs a git checkout.
FROM base AS build
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN pnpm build

# Production dependencies only for the final images.
FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Production image: no secrets are baked in. Without SESSION_SECRET the process refuses to start (src/config/env.ts);
# Databricks Apps / the deploy pipeline inject it (ADR-0004, ADR-0007). The pinned web build is copied into public/ by
# the deploy pipeline (ADR-0007 §3); an image without public/index.html serves the API only.
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    PORT=3001
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]

# Mock image for the web E2E (brief L109): same bundle, mock providers, starts with no -e flags.
# Choice: NODE_ENV=development instead of production + a fake secret, so no secret-looking value exists in any layer
# and the production fail-fast rule stays untouched. The session store is the in-memory one (single container).
FROM runtime AS mock
ENV NODE_ENV=development \
    PROVIDERS_DEFAULT=mock \
    MOCK_SCENARIO=default \
    PORT=3001
# The mock router validates documented response fixtures at startup. They are source assets rather than test inputs
# because the test and tools directories are intentionally excluded from container builds.
COPY --from=build --chown=node:node /app/src/presentation/http/routes/mock-examples ./mock-examples
