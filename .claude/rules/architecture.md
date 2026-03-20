# Architecture — nextjs-multizone-tmdb

## Tech Stack
| Category | Technology | Version |
|---|---|---|
| Package Manager | pnpm | 10.x |
| Monorepo / Build | Turborepo | latest |
| Framework | Next.js | 15.x (App Router) |
| React | React | 19.x |
| Data fetching | TanStack Query | 5.x |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.x (strict) |
| Testing | Vitest + React Testing Library | 3.x + 16.x |
| API Client | @fubar-it-co/http-client (heyAPI generated — never edit manually) | — |

## Project Structure
```
apps/
├── web/      port 3000 — Orchestrator, rewrites only (no UI)
├── home/     port 3001 — Landing, Trending, Popular, FreeToWatch, Featured Actors
├── media/    port 3002 — Movie/TV detail, Cast, Crew, Photos
├── talents/  port 3003 — Actor/Director detail, Filmography, Photos
└── search/   port 3004 — Search, Filters, Discovery

turbo.json        — task definitions, pipeline, caching
pnpm-workspace.yaml
tsconfig.base.json
eslint.config.mjs
.prettierrc
```

## Shared Packages (npm — @fubar-it-co/*)
All packages come from the npm registry. Never create local packages here.
To update a package: edit in vite-mf-monorepo → republish → bump version in this project.

| Package | Contents |
|---|---|
| `@fubar-it-co/ui` | Design system: Avatar, Badge, Button, Card, Carousel, Icon, Image, Modal, Rating, Skeleton, Spinner, Tabs, Typography, Talent, HeroImage, MovieCard, ConditionalWrapper |
| `@fubar-it-co/layouts` | Container, Section, Header, Footer, RootLayout |
| `@fubar-it-co/tokens` | Design tokens OKLCH/DTCG, CSS vars + Tailwind @theme |
| `@fubar-it-co/shared` | mocks, test-utils, utils (tmdbImage, etc.) |
| `@fubar-it-co/http-client` | TMDB heyAPI client + TanStack Query option factories |

## CSS Architecture
- Tailwind v4, CSS-first (no tailwind.config.js)
- Tokens from `@fubar-it-co/tokens` — OKLCH, CSS vars + Tailwind @theme
- CSS prefix per zone (Tailwind v4 prefix isolation):
  - `apps/home`: `hm:`
  - `apps/media`: `mda:`
  - `apps/talents`: `tl:`
  - `apps/search`: `sr:`
  - `@fubar-it-co/ui`: `ui:`
  - `@fubar-it-co/layouts`: `layout:`
- `clsx` for conditional classes
- No CSS Modules, no CSS-in-JS

## Multi-Zones Architecture
Each zone app is a fully standalone Next.js 15 app:
- Own `next.config.ts`, `app/` directory, `package.json`, port
- Deployed independently
- `apps/web` orchestrates all zones via fallback rewrites

The agents will use the colocation approach and naming convention for any component ony used in one zone. 

```typescript
// apps/web/next.config.ts
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

## Data Fetching Strategy
- Server Components fetch via `prefetchQuery` + `dehydrate` + `HydrationBoundary`
- Client Components use `useQuery` — always hits cache on first render (no waterfall)
- `prefetchQuery` and `useQuery` MUST use the same options factory from `@fubar-it-co/http-client`
- ISR `revalidate` and TanStack Query `staleTime` must be aligned (both 24h by default)
- No direct `fetch()` calls in components — always use http-client option factories

## Scripts
```bash
pnpm dev              # all zones in parallel (Turborepo)
pnpm build            # all zones (with Turborepo caching)
pnpm lint             # ESLint entire project
pnpm lint:fix         # ESLint auto-fix
pnpm type-check       # TypeScript no-emit
pnpm test             # Vitest
pnpm coverage         # Vitest + coverage
pnpm kill-ports       # kill dev servers on ports 3000-3004
```

## Git & Commits
Conventional commits — pre-commit hook runs: typecheck + lint + test.

Allowed types: `build chore ci docs feat fix perf refactor revert style test`

Format: `type(scope): subject` (lowercase subject, no trailing period, max 100 chars)

Examples:
- `feat(home): add TrendingSection with SSR prefetch`
- `fix(media): resolve hydration mismatch on Cast section`
- `refactor(talents): extract FilmographyTabs to client component`

## Deploys

No deploys on Vercel. Deploys will be done through the CI to netlify

## TMDB Image URLs
```typescript
// Construct full URL with size
`https://image.tmdb.org/t/p/${size}${path}`

// OFFICIALLY SUPPORTED SIZES
// Posters:   w92, w154, w185, w342, w500, w780, original
// Backdrops: w300, w780, w1280, original
// Profiles:  w45, w185, h632, original
// Still:     w92, w185, w300, original
// Logos:     w45, w92, w154, w185, w300, w500, original
```

## Responsive Breakpoints (mobile-first)
```
sm: 640px   md: 768px   lg: 1024px   xl: 1280px   2xl: 1536px
```

## Section max-width
`max-w-screen-xl` (1280px) via Section component from `@fubar-it-co/layouts`.

## Forbidden
```
❌ console.log              → use console.warn / console.error
❌ explicit any             → strict TypeScript
❌ CSS Modules              → Tailwind only
❌ CSS-in-JS                → Tailwind only
❌ <img>                    → use next/image
❌ <a href> (internal)      → use next/link
❌ direct fetch() in components → use http-client option factories
❌ edit @fubar-it-co/http-client → regenerate in vite-mf-monorepo
❌ useQuery without prefetchQuery → waterfall, kills SSR benefit
❌ unsorted imports         → ESLint enforced
❌ unused vars/imports      → ESLint enforced
```
