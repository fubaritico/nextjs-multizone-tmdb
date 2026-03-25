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

- Phase 3 (home): shared package deps + TanStack Query provider + RootLayout
- Added deps: @tanstack/react-query, @fubar-it-co/tmdb-client, @vite-mf-monorepo/ui, layouts, shared, tokens, clsx, fonts
- Created QueryProvider client component (apps/home/src/providers/QueryProvider.tsx)
- Wired RootLayout from @vite-mf-monorepo/layouts/next into layout.tsx
- Updated globals.css: theme (bundled fonts+tokens), layouts styles, ui styles
- Bumped catalog: layouts 0.3.4, shared 0.0.3, added tokens 0.0.4
- Fixed .gitignore: **/.next/ for all zone apps, removed cached .next from git

- Multi-agent migration workflow: orchestrator.md (7-batch plan), dev.md (merged dev+reviewer+test-writer), scaffold-dev.md
- Removed reviewer.md and test-writer.md (merged into dev.md)
- Shared deps added to media, talents, search (tanstack, ui, layouts, shared, tokens, clsx, fonts)
- Test infra (vitest.config.ts + vitest.setup.ts + passWithNoTests) added to all 4 zone apps
- Test devDeps added to all 4 zones (vitest, RTL, jest-dom, user-event)
- Workflow state files: `.workflow/state/shared-context.md`, `.workflow/state/task-log.json`

- Batch 1-3 migration (committed):
  - `766efe1` build(workspace): bump catalog deps and fix gitignore for monorepo
  - `06b96a1` feat(home): add home page with SSR prefetch and all section components
  - `b415684` test(home): rewrite all tests with MSW + real UI components (42 tests, 15 files)
  - `148e48b` feat(workspace): add layouts, providers, and error pages to media, talents, search zones
  - `554f2d9` docs(claude): add testing rules, troubleshooting, and upstream fix docs
- Home zone complete: page.tsx (SSR prefetch), QueryProvider, error/not-found, all 5 sections with carousels + tests
- Media zone scaffolded: layout, QueryProvider, error/not-found, types
- Talents zone scaffolded: layout, QueryProvider, error/not-found, actor/[id]/, director/[id]/ route stubs
- Search zone scaffolded: layout, QueryProvider, error, search/ route stub
- Test infra: MSW + real UI pattern, server.deps.inline for ESM
- Documentation: patterns-testing.md, troubleshooting.md
- Updated auto-memory (MEMORY.md) with migration workflow state and testing gotchas

- Upstream fix: @vite-mf-monorepo/ui 0.2.0 — MovieCard/Button link components now have /next export (next/link + href)
  - `ffb838f` refactor(home): migrate MovieCard imports to @vite-mf-monorepo/ui/next
  - `117dc54` docs(claude): update rules for ui/next exports and remove resolved fix files
- Migrated all 5 carousel components from `to` prop → `href` prop (ui/next export)
- Removed react-router-dom mock from apps/home/vitest.setup.ts
- Deleted .claude/fixes/ui-button-react-router-link.md and ui-moviecard-react-router-link.md (resolved)
- Updated patterns-ui.md, patterns-client-component.md, troubleshooting.md for ui/next exports
- Added "lint:fix after every modification" rule to CLAUDE.md

- Home zone alignment with legacy (3 commits):
  - `6986c30` refactor(home): align HeroSection with legacy
    - Whole slide wrapped in Link, h2+body-sm typography
    - No rating/year/button, matched overlay/skeleton/error
  - `0173e69` refactor(home): align page layout with legacy
    - Container variant="default|muted" + Section in page.tsx
    - Removed Section from section components
    - Fixed FreeToWatch prefix "free-to-watch"→"free"
    - Extracted getQueryClient(), inlined revalidate
  - `fa5a349` refactor(home): import HeroImage from ui/next
- Upstream: @vite-mf-monorepo/ui — HeroImage /next variant published
- Task plan for legacy: .claude/tasks/heroimage-next-variant.md

- Image optimization strategy decided (next/image for all zones):
  - Analyzed legacy MovieCard, Image component, carousel lazy loading
  - Compared with Odalys SafeImage pattern (next/image wrapper, dual blur, SVG fallback)
  - Researched next/image lazy loading in horizontal carousels (Chrome 121+ native support)
  - Researched @plaiceholder/next — maintenance mode, incompatible with Turbopack/Next.js 16
  - Wrote task plan for legacy: `.claude/tasks/moviecard-next-image.md`
    - NextImage reusable wrapper, MovieCardContent /next variant, HeroImage refactor
  - Upstream: @vite-mf-monorepo/ui 0.4.0 published (NextImage, next/image in MovieCard+HeroImage)
  - `4f74480` build(workspace): upgrade ui to 0.4.0 and add TMDB image remote patterns
  - `553a329` docs(claude): update session state and add legacy-rag rule
  - All 4 zone next.config.ts have images.remotePatterns for image.tmdb.org

- Workflow optimization (pre-Batch 4 review):
  - Analyzed home zone as implementation reference for media agents
  - Inventoried media mock data: movie fully covered, TV missing credits/images/videos handlers
  - Decided Strategy B: separate Movie/TV variant components (no shared conditionals)
  - Removed M-3 (absorbed route-level error/not-found into M-2)
  - Merged M-5 + M-6 into single task "Synopsis + Crew"
  - Moved M-7 (Cast) up to Batch 4 (was Batch 5, no dependency reason to wait)
  - Updated shared-context.md with POST-HOME lessons (no hooks/, no tabs, section order, TV gaps, home references)
  - Updated orchestrator.md batch plan + 5 new brief-writing rules (9–13)
  - Updated task-log.json with revised task structure and notes

- Batch 4-6 media zone migration (1 commit):
  - `82f2908` feat(media): add movie/tv detail pages with all sections and photo viewer
  - 59 files, 5040 insertions — 126 media tests pass + 12 todo
- Batch 4 — M-2 (layouts+slots), M-4 (MediaHero), M-5 (Synopsis+Crew), M-7 (Cast):
  - movie/[id]/layout.tsx + tv/[id]/layout.tsx with @modal parallel route slot
  - @modal/default.tsx, error.tsx, not-found.tsx for both movie and tv
  - MovieHero + TVHero (useQuery + HeroImage from ui/next)
  - MovieSynopsis + TVSynopsis, MovieCrew + TVCrew (Director + Writing filter)
  - MovieCastCarousel + TVCastCarousel (Talent + Carousel UI)
- Batch 5 — M-8 (Similar), M-9 (Recommended), M-10 (Trailers), P-1 (PhotoViewer):
  - MovieSimilarCarousel + TVSimilarCarousel (MovieCard carousel)
  - MovieRecommendedCarousel + TVRecommendedCarousel
  - MovieTrailersSection + TVTrailersSection (YouTube iframe, official trailer filter)
  - PhotoViewer (full-screen, keyboard nav, prev/next, close)
- Batch 6 — M-11 (pages), P-2 (standalone photos), P-3 (modal photos), P-4 (BackdropSection):
  - movie/[id]/page.tsx + tv/[id]/page.tsx (prefetchQuery all + HydrationBoundary + generateMetadata)
  - Standalone photo pages (movie + tv) — Server Components
  - Intercepted @modal photo pages — Client Components with use(params)
  - MovieBackdropSection + TVBackdropSection (photo grid with links)
- Subagent permission setup: .claude/settings.json allow rules for Write/Bash

### Next
1. Manual E2E verification (P-5): run the app, test movie/tv detail pages, photo modal/standalone/back navigation
2. Post-migration fix: CastSection should be a list, not a carousel (noted during M-7)
3. Resume migration: talents zone (Batch 7+) or search zone

### Known Issues
- Packages from npm: if a component needs updating, edit in vite-mf-monorepo, republish, bump version here
- env vars: `VITE_*` prefix kept for compatibility with existing tmdb-client package
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
- CastSection (M-7) is implemented as a carousel but should be a list — post-migration fix needed

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
| `patterns-testing.md` | Vitest + RTL + MSW test patterns |
| `troubleshooting.md` | SSR/hydration debug, zone routing issues |

**Before coding**: ask which reference files are needed — do NOT start coding without the relevant files loaded.

## Legacy code recall

Always use the `recall` MCP tool when working on any feature that may exist in the legacy project (`vite-mf-monorepo`). Use it proactively — before implementing components, hooks, API calls, patterns, or logic — to check how it was done in the legacy codebase. Use a natural language query. Never use regex search or `/explore-legacy`.

## Migration Workflow
See `.claude/agents/orchestrator.md`
