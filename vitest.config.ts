import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/application/**/*.ts', 'src/presentation/**/*.ts', 'src/domain/**/*.ts'],
      exclude: ['**/*.test.ts'],
      thresholds: {
        lines: 85,
        branches: 80,
      },
    },
  },
});
