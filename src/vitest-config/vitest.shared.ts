import { defineConfig } from 'vitest/config'

/**
 * Shared Vitest defaults for Atlex packages (coverage thresholds + reporters).
 */
export const sharedTestConfig = defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/index.ts',
        '**/types.ts',
      ],
    },
  },
})
