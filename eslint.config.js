import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import security from 'eslint-plugin-security';
import globals from 'globals';
import { configs as tsConfigs } from 'typescript-eslint';

import { boundariesConfig } from './tools/architecture/boundaries.js';

const TS_FILES = ['**/*.ts'];
const JS_FILES = ['**/*.js', '**/*.cjs', '**/*.mjs'];

export default defineConfig(
  // Planted fixtures break the layer rules on purpose and may import packages that are not installed;
  // only `pnpm check:architecture:planted` looks at them.
  globalIgnores([
    'dist/**',
    'dist-contract/**',
    'coverage/**',
    'package/**',
    'tools/arch-fixtures/planted/**',
  ]),

  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  n.configs['flat/recommended-module'],
  security.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver(), createNodeResolver()],
    },
    rules: {
      'no-console': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // import-x resolves TypeScript paths (".js" specifiers that point at ".ts" sources); eslint-plugin-n does not.
      'n/no-missing-import': 'off',
      // Tooling config files import devDependencies by design; the BFF is never published to npm.
      'n/no-unpublished-import': 'off',
    },
  },

  {
    files: TS_FILES,
    extends: [tsConfigs.strictTypeChecked, tsConfigs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        // vitest.config.ts is tooling config outside tsconfig.json's include; type it with the default project.
        projectService: { allowDefaultProject: ['vitest.config.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
    },
  },
  {
    files: JS_FILES,
    extends: [tsConfigs.disableTypeChecked],
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },

  {
    files: ['src/**/*.ts', 'tools/arch-fixtures/valid/**/*.ts'],
    ...boundariesConfig,
  },

  {
    files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    ...vitest.configs.recommended,
    rules: {
      ...vitest.configs.recommended.rules,
      // Contract assertion helpers (tests/helpers) count as assertions.
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expectStrictRoundTrip', 'expectSectionVariants'] },
      ],
    },
  },

  // Must stay last: turns off stylistic rules that Prettier owns.
  prettierConfig,
);
