import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        branches: 65,
        functions: 80,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '*.config.*',
        '**/*.d.ts',
        'src/app/layout.tsx',
      ],
    },
    server: {
      deps: {
        inline: [
          '@fubar-it-co/tmdb-client',
          '@vite-mf-monorepo/layouts',
          '@vite-mf-monorepo/ui',
          '@vite-mf-monorepo/shared',
        ],
      },
    },
  },
})
