// ESLint config used only by `pnpm check:architecture:planted`: layer boundaries and import cycles, without
// type information (planted fixtures are excluded from tsconfig and may import packages that are not installed).
import { defineConfig } from 'eslint/config';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import { parser as tsParser } from 'typescript-eslint';

import { boundariesConfig } from './boundaries.js';

export default defineConfig({
  files: ['tools/arch-fixtures/planted/**/*.ts'],
  languageOptions: { parser: tsParser, sourceType: 'module' },
  plugins: { 'import-x': importX, ...boundariesConfig.plugins },
  settings: {
    ...boundariesConfig.settings,
    ...importX.flatConfigs.typescript.settings,
    'import-x/resolver-next': [createTypeScriptImportResolver()],
  },
  rules: {
    ...boundariesConfig.rules,
    'import-x/no-cycle': 'error',
  },
});
