# Fix: Dual React in @vite-mf-monorepo/shared

## Problem

`@vite-mf-monorepo/shared` declares `react` and `react-dom` as **regular dependencies** instead of **peer dependencies**. This causes pnpm to install a nested copy under `node_modules/@vite-mf-monorepo/shared/node_modules/react/`, creating two React instances at runtime.

### Current (broken)

```json
// packages/shared/package.json
"dependencies": {
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-router-dom": "7.5.2",
  ...
}
```

### Consequence

Any export from `@vite-mf-monorepo/shared` that touches React (hooks, components, JSX) uses the nested React 19.1.0 while the consuming app uses React 19.2.4. pnpm won't dedupe different versions → two React instances → crash:

```
TypeError: Cannot read properties of null (reading 'useState')
```

### Affected exports (test-utils)

These all use React internally and are broken in the consumer:
- `renderWithReactQuery`
- `renderComponentWithRouter`
- `renderReactQueryWithRouter`
- `renderWithRouter`
- `ReactQueryWrapper`

### Unaffected exports

These are plain data/functions, no React involved:
- All mock data (`mockNowPlayingMovies`, `mockTrendingDay`, etc.)
- All MSW handlers (`nowPlayingHandlers`, `trendingHandlers`, etc.)
- Utilities (`retry`, `healthCheck`, `tmdbImage`, `getBlurDataUrl`)
- CSS (`theme.css`, `fonts.css`)

## Fix needed in vite-mf-monorepo

### 1. Move react/react-dom to peerDependencies

```json
// packages/shared/package.json
"peerDependencies": {
  "@tanstack/react-query": "5.74.4",
  "@testing-library/react": "16.3.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
},
"dependencies": {
  "react-router-dom": "7.5.2",  // also consider moving to peerDeps
  "svg-to-jsx": "^1.0.4",
  "svgr": "^2.0.0"
}
```

### 2. Also consider for `react-router-dom`

Since we're migrating away from React Router to Next.js routing, `react-router-dom` shouldn't be a dependency either. The test-utils that use `renderComponentWithRouter` / `renderWithRouter` won't be needed in the Next.js project. But if kept for legacy compatibility, it should be a peerDependency too.

### 3. Bump `@types/react` to match

Current shared has `@types/react: 19.1.0`, consumer project has `@types/react: 19.2.14`. Align or use `^19.0.0` range.

### 4. Republish

After fixing, bump version and republish. Then in nextjs-multizone-tmdb:
```bash
pnpm up @vite-mf-monorepo/shared
```

### 5. Verify

After the fix, the nested `node_modules/@vite-mf-monorepo/shared/node_modules/react/` directory should no longer exist — pnpm will dedupe to the root `react`.

## Workaround (current project)

Until the fix is published, in `nextjs-multizone-tmdb`:
- **Do not use** test-utils from `@vite-mf-monorepo/shared/test-utils`
- **Do use** mock data and MSW handlers from `@vite-mf-monorepo/shared/mocks` (safe, no React)
- Use `render` from `@testing-library/react` directly with a local QueryClient wrapper