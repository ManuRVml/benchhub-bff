// Layer rules (brief §4.2), enforced in CI by `pnpm check:architecture`.
// eslint-plugin-boundaries enforces the same rules in the editor (tools/architecture/boundaries.js).
//
// Every rule captures the layer root in $1 (src, tools/arch-fixtures/valid or tools/arch-fixtures/planted), so
// fixtures are judged against their own tree. The rules do not overlap: each planted fixture breaks exactly one.
const ROOT = '^(src|tools/arch-fixtures/(?:valid|planted))';
const layer = (name) => `${ROOT}/${name}/`;
const sameRoot = (names) => `^$1/(${names.join('|')})/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'presentation-only-application-contracts',
      comment:
        'presentation -> only application and contracts (infrastructure is covered by its own rule).',
      severity: 'error',
      from: { path: layer('presentation') },
      to: { path: sameRoot(['domain', 'ports', 'config', 'composition-root']) },
    },
    {
      name: 'application-only-domain-ports',
      comment:
        'application -> only domain and ports: no other layer, no npm package, no Node built-in (infrastructure is covered by its own rule).',
      severity: 'error',
      from: { path: layer('application') },
      to: { pathNot: sameRoot(['application', 'domain', 'ports', 'infrastructure']) },
    },
    {
      name: 'domain-no-external',
      comment: 'domain -> nothing external: no other layer, no Express, no SDK, no Node built-in.',
      severity: 'error',
      from: { path: layer('domain') },
      to: { pathNot: sameRoot(['domain', 'infrastructure']) },
    },
    {
      name: 'infrastructure-not-from-presentation-application',
      comment: 'infrastructure is never imported by presentation or application.',
      severity: 'error',
      from: { path: `${ROOT}/(presentation|application)/` },
      to: { path: '^$1/infrastructure/' },
    },
    {
      name: 'infrastructure-only-from-composition-root',
      comment: 'Only composition-root imports concrete infrastructure classes.',
      severity: 'error',
      from: {
        path: ROOT,
        pathNot: `${ROOT}/(composition-root|infrastructure|presentation|application)/`,
      },
      to: { path: '^$1/infrastructure/' },
    },
    {
      name: 'infrastructure-implements-ports',
      comment: 'infrastructure -> only ports, domain and config (plus packages); never upwards.',
      severity: 'error',
      from: { path: layer('infrastructure') },
      to: { path: sameRoot(['presentation', 'application', 'contracts', 'composition-root']) },
    },
    {
      name: 'ports-only-domain',
      comment:
        'ports -> only domain; npm packages are not allowed, Node built-in types (e.g. streams) are (infrastructure is covered by its own rule).',
      severity: 'error',
      from: { path: layer('ports') },
      to: {
        pathNot: sameRoot(['ports', 'domain', 'infrastructure']),
        dependencyTypesNot: ['core'],
      },
    },
    {
      name: 'contracts-self-contained',
      comment:
        'contracts (published view models) depend on no other layer (infrastructure is covered by its own rule).',
      severity: 'error',
      from: { path: layer('contracts') },
      to: {
        path: sameRoot([
          'presentation',
          'application',
          'domain',
          'ports',
          'config',
          'composition-root',
        ]),
      },
    },
    {
      name: 'no-circular',
      comment: 'No dependency cycles.',
      severity: 'error',
      from: { path: ROOT },
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      comment:
        'Real code imports only modules that resolve (planted fixtures may import missing packages).',
      severity: 'error',
      from: { path: ROOT, pathNot: '^tools/arch-fixtures/planted/' },
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    // Resolving NodeNext ".js" specifiers to ".ts" sources is built into dependency-cruiser.
    enhancedResolveOptions: {
      extensions: ['.ts', '.js', '.json'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
