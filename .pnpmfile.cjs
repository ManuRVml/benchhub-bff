// typescript@7 (native compiler) has no classic JS compiler API. Lint and architecture tooling that loads
// `typescript` as a library gets the last JS-API release instead; `pnpm typecheck` keeps using typescript@7.
// See docs/architecture/tech-stack.md ("TypeScript API for tooling").
const TOOLING_TYPESCRIPT = '6.0.3';
const USES_TYPESCRIPT_API =
  /^(@typescript-eslint\/|typescript-eslint$|ts-api-utils$|eslint-plugin-n$|@vitest\/eslint-plugin$|dependency-cruiser$)/;

function readPackage(pkg) {
  if (USES_TYPESCRIPT_API.test(pkg.name)) {
    if (pkg.peerDependencies) delete pkg.peerDependencies.typescript;
    if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: TOOLING_TYPESCRIPT };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
