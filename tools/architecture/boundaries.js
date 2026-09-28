// Layer boundaries (brief §4.2) for eslint-plugin-boundaries. dependency-cruiser enforces the same rules in
// .dependency-cruiser.cjs; keep both in sync when a layer or rule changes.
import boundaries from 'eslint-plugin-boundaries';

const ROOTS = ['src', 'tools/arch-fixtures/valid', 'tools/arch-fixtures/planted'];
const LAYERS = [
  'presentation',
  'application',
  'domain',
  'ports',
  'infrastructure',
  'contracts',
  'config',
  'composition-root',
];

const element = (layer) => ({
  type: layer,
  partialMatch: false,
  pattern: ROOTS.map((root) => `${root}/${layer}/**`),
});

const allowTo = (from, to, message) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: to } } } },
  message,
});

const allowModules = (from, origins) => ({
  from: { element: { types: { anyOf: from } } },
  allow: { to: origins.map((origin) => ({ module: { origin } })) },
});

const noModules = (from, origins, message) => ({
  from: { element: { type: from } },
  disallow: { to: origins.map((origin) => ({ module: { origin } })) },
  message,
});

export const boundariesConfig = {
  plugins: { boundaries },
  settings: {
    'boundaries/elements': LAYERS.map(element),
    // boundaries resolves imports through the eslint-plugin-import resolver interface (NodeNext ".js" -> ".ts").
    'import/resolver': { typescript: { alwaysTryTypes: true }, node: true },
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        // Also judge imports of npm packages and Node built-ins, not only local files.
        checkAllOrigins: true,
        message:
          'Layer boundary violated (brief §4.2): {{from.type}} must not depend on {{to.type}}.',
        policies: [
          allowTo(
            'presentation',
            ['application', 'contracts'],
            'presentation may depend only on application and contracts.',
          ),
          allowTo(
            'application',
            ['domain', 'ports'],
            'application may depend only on domain and ports.',
          ),
          allowTo('ports', ['domain'], 'ports may depend only on domain.'),
          allowTo(
            'infrastructure',
            ['ports', 'domain', 'config'],
            'infrastructure implements ports; it may depend only on ports, domain and config.',
          ),
          allowTo('composition-root', LAYERS, 'composition-root wires every layer.'),
          allowModules(
            ['presentation', 'infrastructure', 'contracts', 'config', 'composition-root'],
            ['external', 'core'],
          ),
          allowModules(['ports'], ['core']),
          noModules(
            'domain',
            ['external', 'core'],
            'domain must not import packages or Node built-ins (no Express, no SDKs).',
          ),
          noModules(
            'application',
            ['external', 'core'],
            'application may depend only on domain and ports: no packages or Node built-ins.',
          ),
          noModules(
            'ports',
            ['external'],
            'ports may depend only on domain (Node built-in types such as streams are allowed).',
          ),
        ],
      },
    ],
  },
};
