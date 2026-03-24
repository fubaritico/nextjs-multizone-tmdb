# Troubleshooting — nextjs-multizone-tmdb

## Vitest: ESM directory import errors

**Symptom**: `Directory import '.../dist/client' is not supported resolving ES modules`

**Cause**: `@fubar-it-co/tmdb-client` and `@vite-mf-monorepo/layouts` use bare directory imports internally (e.g. `export * from './client'` instead of `./client/index.js`). Node's ESM resolver rejects these.

**Fix**: Add `server.deps.inline` to `vitest.config.ts`:
```typescript
test: {
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
}
```

## Vitest: React Router context crash in UI components (RESOLVED)

**Status**: Fixed in `@vite-mf-monorepo/ui` 0.2.0+

**Solution**: Import link components from `@vite-mf-monorepo/ui/next` instead of `@vite-mf-monorepo/ui`. The `/next` export uses `next/link` + `href` prop. No `react-router-dom` mock needed.

## Vitest: JSX in .ts setup file

**Symptom**: `Expected ">" but found "href"` in vitest.setup.ts

**Cause**: Setup file uses `.ts` extension, not `.tsx`. esbuild won't process JSX in `.ts` files.

**Fix**: Use `createElement()` instead of JSX in setup files, or rename to `.tsx`.