# nextjs-multizone-tmdb — Claude Code Instructions

## Project
TMDB media app. Next.js 15 App Router + Multi-Zones + Turborepo. pnpm workspaces.
Migration from vite-mf-monorepo (Module Federation CSR) → SSR/RSC, production-ready, SEO-first.

### Zone Structure
```
apps/web         port 3000 — Orchestrator + rewrites (no UI, pure routing)
apps/home        port 3001 — Core/Landing (Landing, Trending, Popular, FreeToWatch, Featured Actors)
apps/media       port 3002 — Media Details (Movie/TV detail, Cast, Crew, Photos)
apps/talents     port 3003 — Talent (Actors, Directors, Filmography, Photos)
apps/search      port 3004 — Search/Discovery (Search, Filters, Advanced)
```

### Shared packages (from npm registry — @fubar-it-co/*)
- `@fubar-it-co/ui` — design system (Avatar, Badge, Button, Card, Carousel, Icon, Image, Modal, Rating, Skeleton, Spinner, Tabs, Typography, Talent, HeroImage, MovieCard, ConditionalWrapper)
- `@fubar-it-co/layouts` — Container, Section, Header, Footer, RootLayout
- `@fubar-it-co/tokens` — design tokens OKLCH/DTCG, CSS vars + Tailwind @theme
- `@fubar-it-co/shared` — mocks, test-utils, utils (tmdbImage, etc.)
- `@fubar-it-co/http-client` — TMDB heyAPI generated client + TanStack Query option factories

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

## Architecture: Next.js 15 Multi-Zones

### Key Concepts
- **Server Components** — default in Next.js 15, no `'use client'` unless needed
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

**CRITICAL**: `prefetchQuery` and `useQuery` MUST use the same options factory from `@fubar-it-co/http-client` to guarantee identical `queryKey` → cache HIT.

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
- Order: external → @fubar-it-co/* → relative → `import type` (blank line between groups)
- Always `next/image` — never `<img>` directly
- Always `next/link` — never `<a href>` for internal navigation

### CSS / Tailwind
- CSS prefixes per zone: `hm:` (home), `mda:` (media), `tl:` (talents), `sr:` (search)
- Shared prefixes: `ui:` (packages/ui), `layout:` (layouts)
- `clsx` for conditional classes
- Tailwind v4, tokens from `@fubar-it-co/tokens`

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
- Husky v9: pre-commit (type-check + lint), commit-msg (commitlint)
- Added `"type": "module"` to package.json

### Next
- Phase 1: Setup Turborepo + pnpm workspaces + shared tsconfig
- Phase 2: Init 5 zone apps (web, home, media, talents, search)
- Phase 3: Home zone (HeroSection, TrendingSection, PopularSection, FreeToWatchSection, FeaturedActorsSection)

### Known Issues
- Packages from npm: if a component needs updating, edit in vite-mf-monorepo, republish, bump version here
- env vars: `VITE_*` prefix kept for compatibility with existing http-client package

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
| `patterns-ui.md` | New UI component in @fubar-it-co/ui |
| `architecture.md` | Stack, Turborepo, Multi-Zones, rewrites |
| `troubleshooting.md` | SSR/hydration debug, zone routing issues |

**Before coding**: ask which reference files are needed — do NOT start coding without the relevant files loaded.
