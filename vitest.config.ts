import { mergeConfig } from 'vitest/config'
import { defineConfig } from 'vitest/config'

import { sharedTestConfig } from './src/vitest-config/vitest.shared.ts'

export default mergeConfig(
  sharedTestConfig,
  defineConfig({
    test: {
      include: ['tests/**/*.test.ts'],
      pool: 'forks',
      setupFiles: ['./src/setup.ts'],
      coverage: {
        enabled: false,
      },
    },
  }),
)
