# nextjs-multizone-tmdb — Claude Code Instructions

## Project
TMDB media app. Next.js 16 App Router + Multi-Zones + Turborepo. pnpm workspaces.
Migration from vite-mf-monorepo (Module Federation CSR) → SSR/RSC, production-ready, SEO-first.
A person having pulled the repo MUST be able to install and run the app in development mode without any additional steps.

### Zone Structure
```
apps/web         port 3000 — Orchestrator + rewrites (no UI, pure routing)
apps/home        port 3001 — Core/Landing (Landing, Trending, Popular, FreeToWatch, Featured Actors)
apps/media       port 3002 — Media Details (Movie/TV detail, Cast, Crew, Photos)
apps/talents     port 3003 — Talent (Actors, Directors, Filmography, Photos)
apps/search      port 3004 — Search/Discovery (Search, Filters, Advanced)
```

### Shared packages (from npm registry)
- `@vite-mf-monorepo/ui` — design system (Avatar, Badge, Button, Card, Carousel, Icon, Image, Modal, Rating, Skeleton, Spinner, Tabs, Typography, Talent, HeroImage, MovieCard, ConditionalWrapper)
- `@vite-mf-monorepo/layouts` — Container, Section, Header, Footer, RootLayout
- `@vite-mf-monorepo/shared` — mocks, test-utils, utils (tmdbImage, etc.)
- `@fubar-it-co/tmdb-client` — TMDB heyAPI generated client + TanStack Query option factories

> Packages are consumed from npm. To update: edit in vite-mf-monorepo, republish, bump version here.

---

## Critical Workflow Rules
- **Be concise** — no recap, no enumerations, no unsolicited explanations. Act, then report briefly if needed.
- **Discuss approach FIRST** — never code without confirming approach
- **Review → Test → Commit** per change — no accumulation
- **Never execute commands** — propose only. Exception: user says "execute", "run", etc.
- **Risky actions** (git push, reset --hard, rm -rf) require explicit permission EVERY TIME
- **Never hallucinate** — if uncertain, read code first
- **Always use context7** for any question about an API, library, or package
- **Secrets** — live in `.env*` files — never in rules, memory, or code
- **Never `console.log`** — use `console.warn` / `console.error`
- **Never explicit `any`** — strict TypeScript
- **Always run** lint + typecheck + test before commit
- **Model**: Haiku for questions/research, Sonnet for code/commits — suggest Haiku when appropriate

---

## Architecture: Next.js 16 Multi-Zones

### Key Concepts
- **Server Components** — default in Next.js 16, no `'use client'` unless needed
- **`'use client'`** — only for interactivity (useState, event handlers, hooks)
- **`'use server'`** — Server Actions for mutations
- **Data fetching** — `prefetchQuery` server-side + `HydrationBoundary` + `useQuery` client-side
- **Streaming + Suspense** — wrap non-critical sections, always provide Skeleton fallback
- **Multi-Zones** — each app is standalone Next.js, orchestrated via `apps/web` rewrites

### Data Fetching Pattern (React Query + SSR)
Each page Server Component:
1. Creates a `QueryClient` with `staleTime: 24h`
2. `await Promise.all([prefetchQuery(...)])` for ALL initial data in parallel
3. Returns `<HydrationBoundary state={dehydrate(queryClient)}>` wrapping sections
4. Client Components use `useQuery(options)` — guaranteed cache HIT on first render

**CRITICAL**: `prefetchQuery` and `useQuery` MUST use the same options factory from `@fubar-it-co/tmdb-client` to guarantee identical `queryKey` → cache HIT.

```typescript
// CORRECT — same factory, same queryKey
const options = trendingAllOptions({ path: { time_window: 'day' } })
await queryClient.prefetchQuery(options)   // server
const { data } = useQuery(options)          // client → HIT

// WRONG — manual queryKey → cache MISS
queryClient.prefetchQuery({ queryKey: ['trending', { time_window: 'day' }], ... })
useQuery({ queryKey: ['trending', 'day'], ... })  // different shape → MISS
```

### Revalidation alignment
```typescript
const CACHE_24H_MS = 1000 * 60 * 60 * 24
const CACHE_24H_S = 86400

export const revalidate = CACHE_24H_S  // Next.js ISR
// QueryClient staleTime: CACHE_24H_MS  // TanStack Query — must stay aligned
```

### Multi-Zones rewrites (apps/web/next.config.ts)
```typescript
rewrites: {
  fallback: [
    { source: '/', destination: 'http://localhost:3001' },
    { source: '/movie/:id/:path*', destination: 'http://localhost:3002/movie/:id/:path*' },
    { source: '/tv/:id/:path*', destination: 'http://localhost:3002/tv/:id/:path*' },
    { source: '/actor/:id/:path*', destination: 'http://localhost:3003/actor/:id/:path*' },
    { source: '/director/:id/:path*', destination: 'http://localhost:3003/director/:id/:path*' },
    { source: '/search/:path*', destination: 'http://localhost:3004/search/:path*' },
  ],
}
```

---

## Code Conventions

### Components
- Server Components: `export default async function Name({ params }: { params: { id: string } })`
- Client Components: `const Name: FC<NameProps> = ({ ... }) => { ... }` with `'use client'` at top
- `'use client'` only when: useState, useEffect, event handlers, browser APIs, useQuery
- Server Actions: `'use server'` in `app/lib/actions.ts`

### Imports
- Order: external → shared packages → relative → `import type` (blank line between groups)
- Always `next/image` — never `<img>` directly
- Always `next/link` — never `<a href>` for internal navigation

### CSS / Tailwind
- CSS prefixes per zone: `hm:` (home), `mda:` (media), `tl:` (talents), `sr:` (search)
- Shared prefixes: `ui:` (packages/ui), `layout:` (layouts)
- `clsx` for conditional classes
- Tailwind v4, tokens via `@vite-mf-monorepo/ui` and `@vite-mf-monorepo/layouts`

### TypeScript
- Strict mode, never explicit `any`
- `.tsx` for JSX files, `.ts` for pure TS
- Use discriminated unions for polymorphic components

### Testing
- Vitest + React Testing Library
- `userEvent` — never `fireEvent`
- `getByRole` — never `querySelector`
- Co-located with components
- No QueryClient wrapper needed for Server Components (pure async functions)

---

## Session State (updated by `/end-session`)

### Completed
- Project initialized: nextjs-multizone-tmdb
- Skills installed: next-best-practices, next-cache-components, next-upgrade, vercel-react-best-practices, vercel-composition-patterns
- ESLint 9 flat config: typescript-eslint strict/stylistic, eslint-config-next, import ordering, jsx-a11y, prettier integration
- Prettier: `.prettierrc` (no semi, single quotes), `.prettierignore`
- Commitlint: conventional commit rules (same as legacy)
- Husky v9: pre-commit (type-check + lint + test), commit-msg (commitlint)
- Added `"type": "module"` to package.json
- pnpm-workspace.yaml with dependency catalog (testing, shared packages, utilities)
- Vitest + RTL test environment: vitest.config.ts (jsdom, globals, v8 coverage), vitest.setup.ts (jest-dom matchers, ResizeObserver/IntersectionObserver mocks)
- Test scripts: `test`, `test:watch`, `coverage`
- Smoke test for temp Home page (src/app/page.test.tsx)
- Phase 1: Turborepo + shared tsconfig (`turbo.json`, `tsconfig.base.json`, turbo scripts, `packageManager` field)
- Removed temp scaffolding (`src/app/*`, `next.config.ts`, `next/react/react-dom` deps)

- Phase 2: Init 5 zone apps (web:3000, home:3001, media:3002, talents:3003, search:3004)
- apps/web orchestrator with fallback rewrites to zone apps (env-driven URLs)
- Zone apps: next.config.ts, tsconfig.json, postcss.config.mjs, globals.css (Tailwind v4 prefix), layout.tsx, page.tsx
- assetPrefix per zone for multi-zone asset loading
- Fixed ESLint ignore patterns for monorepo (`**/.next/**`, `**/next-env.d.ts`)
- README.md with architecture docs, multi-zone vs micro-frontend comparison, env setup
- Fixed all package references to match catalog (`@vite-mf-monorepo/ui`, `@vite-mf-monorepo/layouts`, `@vite-mf-monorepo/shared`, `@fubar-it-co/tmdb-client`)
- Updated Next.js version references from 15 to 16 across all docs

### Next
- Phase 3: Add shared package deps + TanStack Query providers to zone apps (home first)

### Known Issues
- Packages from npm: if a component needs updating, edit in vite-mf-monorepo, republish, bump version here
- env vars: `VITE_*` prefix kept for compatibility with existing tmdb-client package
- `apps/web/src/app/page.tsx` was removed — web has no root page, relies on fallback rewrite to home

---

## Environment Variables

**apps/web/.env.local**
```
NEXT_PUBLIC_HOME_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_URL=http://localhost:3002
NEXT_PUBLIC_TALENTS_URL=http://localhost:3003
NEXT_PUBLIC_SEARCH_URL=http://localhost:3004
```

**apps/[zone]/.env.local**
```
NEXT_PUBLIC_ASSET_PREFIX=http://localhost:<zone_port>
VITE_TMDB_API_TOKEN=your_token_here
VITE_USE_NETLIFY_CDN=false
```

---

## Reference Files (load on demand — NOT auto-loaded)
| File | When to load |
|---|---|
| `patterns-server-component.md` | Page, layout, async Server Component |
| `patterns-client-component.md` | Section with tabs/state, carousel, interactive |
| `patterns-hydration.md` | prefetchQuery + HydrationBoundary + useQuery full pattern |
| `patterns-server-action.md` | Mutation, useMutation, optimistic update |
| `patterns-ui.md` | New UI component in @vite-mf-monorepo/ui |
| `architecture.md` | Stack, Turborepo, Multi-Zones, rewrites |
| `troubleshooting.md` | SSR/hydration debug, zone routing issues |

**Before coding**: ask which reference files are needed — do NOT start coding without the relevant files loaded.
