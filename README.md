# nextjs-multizone-tmdb

A TMDB media discovery app built with **Next.js 16 Multi-Zones**, **Turborepo**, and **pnpm workspaces**.

This project is a ground-up rewrite of [vite-mf-monorepo](https://github.com/user/vite-mf-monorepo) — migrating from Vite + Module Federation (CSR) to Next.js App Router (SSR/RSC) for production-ready, SEO-first rendering.

## Table of Contents

- [Why This Project](#why-this-project)
- [Architecture](#architecture)
- [Zone Structure](#zone-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Shared Packages](#shared-packages)
- [CSS Architecture](#css-architecture)
- [Tech Stack](#tech-stack)

## Why This Project

### The Problem with Micro-Frontends (Module Federation)

The legacy project used **Vite Module Federation** — runtime-loaded remote apps sharing React, Router, and Query libraries via a shell host. This approach delivered team autonomy and independent deployments, but came with significant trade-offs:

- **No SSR** — blank page until JavaScript loads, parsed, and executes
- **SEO-hostile** — crawlers see empty HTML, no indexable content
- **Slow first paint** — `remoteEntry.js` + React hydration + `useQuery` waterfall = ~2-3s on slow connections
- **Complex runtime** — shared library versioning, remote CSS injection, federation manifests
- **Fragile orchestration** — runtime dependency loading with opaque failure modes

### How Multi-Zones Solve the Same Goals

Next.js Multi-Zones achieve the same micro-frontend benefits — **team autonomy**, **independent deployment**, **technology isolation** — without the runtime complexity:

| Goal | Module Federation | Next.js Multi-Zones |
|---|---|---|
| **Independent deployment** | Each remote deploys its own `remoteEntry.js` | Each zone is a standalone Next.js app |
| **Team autonomy** | Teams own their remote app | Teams own their zone app |
| **Shared UI** | Shared npm packages | Same shared npm packages |
| **Technology isolation** | Runtime module boundaries | Process-level isolation (separate ports) |
| **Composition** | Shell loads remotes at runtime (JS) | Orchestrator rewrites at request time (HTTP) |
| **SSR / SEO** | Not possible (CSR only) | Built-in — Server Components, streaming, ISR |
| **First paint** | ~2-3s (JS waterfall) | ~500ms (SSR streaming, HTML-first) |
| **JS disabled** | Blank page | Full content visible (progressive enhancement) |

The key insight: **HTTP rewrites replace JavaScript runtime loading**. The orchestrator (`apps/web`) routes requests to zone apps via URL rewriting — no shared JS bundles, no runtime federation, no `remoteEntry.js`. Each zone is a full Next.js app that works standalone.

## Architecture

```
                         Browser (localhost:3000)
                                │
                         ┌──────┴──────┐
                         │  apps/web   │  Orchestrator
                         │  port 3000  │  (rewrites only, no UI)
                         └──────┬──────┘
                    ┌───────┬───┴───┬───────┐
                    ▼       ▼       ▼       ▼
              ┌─────────┐ ┌────┐ ┌──────┐ ┌──────┐
              │  home   │ │media│ │talents│ │search│
              │  :3001  │ │:3002│ │ :3003│ │ :3004│
              └─────────┘ └────┘ └──────┘ └──────┘
                    │       │       │       │
                    └───────┴───┬───┴───────┘
                                ▼
                      Shared npm packages
                       @fubar-it-co/*
```

Each zone app is a **fully standalone Next.js application** — it has its own `next.config.ts`, `package.json`, routing, and dev server. The orchestrator stitches them together via fallback rewrites:

```typescript
// apps/web/next.config.ts
rewrites() {
  return {
    fallback: [
      { source: '/', destination: `${homeUrl}/` },
      { source: '/movie/:id/:path*', destination: `${mediaUrl}/movie/:id/:path*` },
      { source: '/tv/:id/:path*', destination: `${mediaUrl}/tv/:id/:path*` },
      { source: '/actor/:id/:path*', destination: `${talentsUrl}/actor/:id/:path*` },
      { source: '/director/:id/:path*', destination: `${talentsUrl}/director/:id/:path*` },
      { source: '/search/:path*', destination: `${searchUrl}/search/:path*` },
    ],
  }
}
```

## Zone Structure

| Zone | Port | Prefix | Responsibility |
|---|---|---|---|
| `apps/web` | 3000 | — | Orchestrator + rewrites (no UI) |
| `apps/home` | 3001 | `hm:` | Landing, Trending, Popular, FreeToWatch, Featured Actors |
| `apps/media` | 3002 | `mda:` | Movie/TV detail, Cast, Crew, Photos |
| `apps/talents` | 3003 | `tl:` | Actor/Director detail, Filmography, Photos |
| `apps/search` | 3004 | `sr:` | Search, Filters, Advanced Discovery |

## Getting Started

### Prerequisites

- **Node.js** >= 22.11.0
- **pnpm** >= 10.7

### Setup

```bash
# Clone
git clone <repo-url>
cd nextjs-multizone-tmdb

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your TMDB API token

# Create per-zone .env.local files (already included — update TMDB token)
# apps/home/.env.local
# apps/media/.env.local
# apps/talents/.env.local
# apps/search/.env.local

# Start all zones
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the orchestrator routes to zone apps automatically.

Each zone also runs standalone:
- [http://localhost:3001](http://localhost:3001) — Home
- [http://localhost:3002](http://localhost:3002) — Media
- [http://localhost:3003](http://localhost:3003) — Talents
- [http://localhost:3004](http://localhost:3004) — Search

## Environment Variables

### Root `.env.local` (apps/web)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_HOME_URL` | Home zone URL | `http://localhost:3001` |
| `NEXT_PUBLIC_MEDIA_URL` | Media zone URL | `http://localhost:3002` |
| `NEXT_PUBLIC_TALENTS_URL` | Talents zone URL | `http://localhost:3003` |
| `NEXT_PUBLIC_SEARCH_URL` | Search zone URL | `http://localhost:3004` |

### Per-zone `.env.local` (apps/home, media, talents, search)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_ASSET_PREFIX` | Zone origin URL (e.g. `http://localhost:3001`) — required for multi-zone asset loading |
| `VITE_TMDB_API_TOKEN` | TMDB API bearer token (`VITE_` prefix for http-client compatibility) |
| `VITE_USE_NETLIFY_CDN` | Use Netlify Image CDN for TMDB images (`false` in dev) |

## Development

### Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all zones in parallel (Turborepo) |
| `pnpm build` | Build all zones (with Turborepo caching) |
| `pnpm lint` | ESLint across all zones |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm type-check` | TypeScript no-emit check |
| `pnpm test` | Vitest |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm coverage` | Vitest with coverage |
| `pnpm reset` | Reset project (clean node_modules, .next, lockfile) |

### Project Structure

```
apps/
├── web/          Orchestrator — rewrites only
├── home/         Landing zone
├── media/        Media details zone
├── talents/      Talent profiles zone
└── search/       Search & discovery zone

Each zone app:
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── src/
    └── app/
        ├── globals.css     Tailwind with zone prefix
        ├── layout.tsx      Root layout
        └── page.tsx        Page component
```

## Shared Packages

All UI and utility packages are consumed from npm (published from the legacy [vite-mf-monorepo](https://github.com/user/vite-mf-monorepo) project):

| Package | Contents |
|---|---|
| `@vite-mf-monorepo/ui` | Design system — Avatar, Badge, Button, Card, Carousel, Icon, Image, Modal, Rating, Skeleton, Spinner, Tabs, Typography, MovieCard, HeroImage |
| `@vite-mf-monorepo/layouts` | Container, Section, Header, Footer, RootLayout |
| `@vite-mf-monorepo/shared` | Mocks, test-utils, utilities (tmdbImage, etc.) |
| `@fubar-it-co/tmdb-client` | TMDB heyAPI generated client + TanStack Query option factories |

> To update a package: edit in vite-mf-monorepo, republish to npm, bump version here.

## CSS Architecture

Tailwind v4 with **per-zone CSS prefixes** for style isolation — each zone's classes are scoped to avoid conflicts when composed through the orchestrator:

```css
/* apps/home/src/app/globals.css */
@import "tailwindcss" prefix(hm);

/* Usage */
<div className="hm:flex hm:gap-4">
```

| Scope | Prefix |
|---|---|
| Home zone | `hm:` |
| Media zone | `mda:` |
| Talents zone | `tl:` |
| Search zone | `sr:` |
| UI components | `ui:` |
| Layouts | `layout:` |

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| React | React 19 |
| Language | TypeScript 5 (strict) |
| Package Manager | pnpm 10 |
| Monorepo | Turborepo |
| Styling | Tailwind CSS 4 |
| Data Fetching | TanStack Query 5 |
| API Client | heyAPI generated (TMDB) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint 9 (flat config) + Prettier |
| Commits | Conventional Commits (commitlint + husky) |
| Deployment | Netlify |