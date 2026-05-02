import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    include: ['e2e/**/*.test.ts'],
    timeout: 30000,
    testTimeout: 30000,
    hookTimeout: 30000,
    globalSetup: './e2e/setup.ts',
  },
})
