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

## Vitest: React Router context crash in UI components

**Symptom**: `TypeError: Cannot destructure property 'basename' of 'React10.useContext(...)' as it is null` from `react-router`

**Cause**: `@vite-mf-monorepo/ui` imports `Link` from `react-router-dom` (legacy). Components like `MovieCard as="link"` use React Router's `<Link>` which requires a Router context.

**Fix**: Mock `react-router-dom` globally in `vitest.setup.ts`:
```typescript
import { createElement } from 'react'
import { vi } from 'vitest'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: Record<string, unknown>) =>
    createElement('a', { href: to, ...props }, children),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
}))
```

## Vitest: JSX in .ts setup file

**Symptom**: `Expected ">" but found "href"` in vitest.setup.ts

**Cause**: Setup file uses `.ts` extension, not `.tsx`. esbuild won't process JSX in `.ts` files.

**Fix**: Use `createElement()` instead of JSX in setup files, or rename to `.tsx`.