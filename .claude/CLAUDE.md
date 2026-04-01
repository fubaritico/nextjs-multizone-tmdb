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
- **Never execute commands** — propose only. Exceptions: (1) user says "execute", "run", etc. (2) `pnpm type-check && pnpm lint && pnpm test` from root — MUST run after every code change, never skip
- **Risky actions** (git push, reset --hard, rm -rf) require explicit permission EVERY TIME
- **Always run** lint + typecheck + test once a set of modifications is done
- **Never hallucinate** — if uncertain, read code first
- **Always use context7** for any question about an API, library, or package
- **Always use legacy-rag** for any question about an API, library, or package from the legacy project, if response for RAG is not clear enough, use '/explore-legacy' command
- **Secrets** — live in `.env*` files — never in rules, memory, or code
- **Never `console.log`** — use `console.warn` / `console.error`
- **Never explicit `any`** — strict TypeScript
- **After every file modification**, run `pnpm lint:fix` to fix ESLint + Prettier format errors in changed files
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
Full history with commit hashes: `.claude/session-history.md`

**Summary**: Phases 1-3 done (project setup, 5 zone apps, home foundation). Batches 1-6 done (home zone complete with 42 tests, media zone complete with 126 tests + 12 todo). E2E fixes done (hydration, asset loading, cross-zone navigation). Upstream packages updated through ui 0.4.12, layouts 0.4.4, tmdb-client 0.0.14. Media zone refactored: unified movie/tv into dynamic `[mediaType]` route, merged Movie/TV component variants into generic components, added barrel index.ts files + utils. Photos renamed from BackdropSection, aligned with legacy bento grid. Cast renamed from CastSection/CastCarousel, replaced carousel with legacy 2-column grid. Page tests rewritten to verify prefetchQuery queryKeys (no component mocking). Added MSW+RTL tests for Cast (7), MediaHero (7), Photos (7) — total 88 tests across home+media. Photo viewer fixed: route interception `(.)photos`, PhotoViewer rewritten with Modal+Carousel lightbox from legacy ui, URL uses photo id (file_path without ext), StandalonePhotoViewer client wrapper for standalone page. Media zone legacy alignment complete: all sections refactored to match legacy file structure. Each section owns its Container+Section wrapper (page.tsx has no layout wrappers). Hooks refactored: replaced dual-query `enabled` anti-pattern with conditional hook selection (`useMedia*` pattern). Split monolith carousels: SimilarCarousel → SimilarMoviesCarousel + SimilarTVCarousel, RecommendedCarousel → RecommendedMoviesCarousel + RecommendedTVCarousel. Total 125 tests (40 home + 85 media). Netlify CI/CD pipeline: 5 deploy workflows (web, home, media, talents, search) with `workflow_run` trigger after CI on main, `dorny/paths-filter` for conditional deploys. CI updated (validate.yml: pnpm version fix, secrets, `pnpm test` via Turborepo). `netlify.toml` per zone with `assetPrefix` redirects. `turbo.json` start task added. CSS on Netlify production fixed via `/<zone>-static/_next/*` → `/_next/:splat` redirects. README updated: live demo link + Netlify status badges, CI/CD section, Netlify deployment section, legacy repo links.

### Next
1. Investigate `--mda-color-muted` CSS var not resolving in media globals.css (tokens prefixed in browser but var() fails)
2. Fix photo viewer prev/next blink (router.replace causes remount)
3. Resume migration: talents zone (Batch 7+) or search zone

### Known Issues
- Packages from npm: if a component needs updating, edit in vite-mf-monorepo, republish, bump version here
- `apps/web/src/app/page.tsx` was removed — web has no root page, relies on fallback rewrite to home
- Font packages (@fontsource/*) are transitive deps of @vite-mf-monorepo/shared — must be installed explicitly in each zone app (Turbopack CSS resolver can't resolve bare @import from inside node_modules)
- @vite-mf-monorepo/layouts components using hooks need 'use client' in source — fixed in 0.3.4
- `ui:` prefixed classes only work inside @vite-mf-monorepo/ui package — zone source files must use zone prefix (hm:, mda:, tl:, sr:)
- `MovieCard` and `Button` with `as="link"` must be imported from `@vite-mf-monorepo/ui/next` (uses `next/link` + `href` prop) — fixed in ui 0.2.0
- `HeroImage` must be imported from `@vite-mf-monorepo/ui/next` (uses `next/image`) — fixed in ui 0.3.0
- `NextImage` exported from `@vite-mf-monorepo/ui/next` (reusable next/image wrapper) — added in ui 0.4.0
- `revalidate` must be a static literal in page.tsx — Next.js can't analyze imported constants
- FeaturedActorsSection exists but is not wired into page.tsx yet (not in legacy Home.tsx either)
- `blurDataURL` React warnings in test stderr are cosmetic — next/image mock passes all props to DOM `<img>` which doesn't recognize `blurDataURL`
- Do NOT use `@plaiceholder/next` — maintenance mode, Turbopack incompatible, Next.js 16 untested. Use `sharp` directly for server-side blur generation
- TV mock data gaps: shared/mocks missing tvSeriesCredits, tvSeriesImages, tvSeriesVideos handlers — TV variants for Cast, Photos, Trailers untestable until upstream publishes
- Multi-zones: `assetPrefix` must be **path-based** (e.g. `/home-static`), not a full URL — full URL breaks hydration through orchestrator
- Multi-zones: orchestrator needs `beforeFiles` rewrites for `/<zone>-static/_next/:path+` to proxy static assets to zone apps
- Upstream: `@vite-mf-monorepo/ui` must use per-file output (not bundled) to preserve `'use client'` directives — barrel `next/index.ts` needs `'use client'`
- `VITE_TMDB_API_TOKEN` exposed to browser via `env` config in each zone's `next.config.ts` (Next.js doesn't auto-expose `VITE_*` vars like Vite does)
- Upstream: `HeroImage` from `@vite-mf-monorepo/ui/next` doesn't set `object-fit: cover` on the `next/image` element — workaround via `.hero-height img { object-fit: cover }` in zone globals.css
- `hero-height` CSS utility must NOT use `aspect-ratio: auto` on lg+ when wrapping `next/image fill` — absolute images don't contribute to container height
- Multi-zones: cross-zone links MUST use `<a>` (or `as="zone-link"`) — `next/link` hangs on routes belonging to other zones
- `MovieCard`/`Button` with `as="zone-link"` from `ui/next` renders `<a>` for cross-zone nav — use `as="link"` only for same-zone routes
- `RootLayout` from `layouts/next` needs `crossZoneHome` prop on non-home zones — logo link uses `<a href="/">` instead of `<Link>`
- Photo viewer prev/next navigation has a visual blink — `router.replace` causes component remount, Carousel re-renders with new `key={initialIndex}`
- `MovieRecommendationsResponse` from tmdb-client is typed as `{ [key: string]: unknown }` — must cast to `MovieSimilarResponse` (identical structure)
- `--mda-color-muted` CSS var in media globals.css — tokens are prefixed with `mda` in browser but var() doesn't resolve (needs investigation)
- Netlify deploys: each zone needs `[[redirects]]` in `netlify.toml` mapping `/<zone>-static/_next/*` → `/_next/:splat` (status 200) — `assetPrefix` makes HTML reference prefixed paths but Netlify CDN serves at `/_next/`
- Deploy workflows use `workflow_run` trigger — deploys only fire after CI passes on `main`
- SonarQube re-enabled in CI — requires `SONAR_TOKEN` secret in GitHub repo settings

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
| `patterns-ui.md` | New UI component in @vite-mf-monorepo/ui |
| `architecture.md` | Stack, Turborepo, Multi-Zones, rewrites |
| `patterns-testing.md` | Vitest + RTL + MSW test patterns |
| `troubleshooting.md` | SSR/hydration debug, zone routing issues |

**Before coding**: ask which reference files are needed — do NOT start coding without the relevant files loaded.

## Legacy code recall

Always use the `recall` MCP tool when working on any feature that may exist in the legacy project (`vite-mf-monorepo`). 
Use it before implementing components, hooks, API calls, patterns, or logic — to check how it was done in the legacy codebase. 
Use a natural language query. Use regex search or `/explore-legacy` as a fallback.
NEVER use the `recall` MCP tool on startup, it will only slow you down.

## Migration Workflow
See `.claude/agents/orchestrator.md`
