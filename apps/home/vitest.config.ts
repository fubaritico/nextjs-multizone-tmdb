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
