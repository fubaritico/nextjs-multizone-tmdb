# nextjs-multizone-tmdb

A TMDB media discovery app built with **Next.js 16 Multi-Zones**, **Turborepo**, and **pnpm workspaces**.

This project is a ground-up rewrite of [vite-mf-monorepo-tmdb](https://github.com/fubaritico/vite-mf-monorepo-tmdb) — migrating from Vite + Module Federation (CSR) to Next.js App Router (SSR/RSC) for production-ready, SEO-first rendering.

## Live Demo

**<a href="https://nextjs-mz-tmdb-web.netlify.app" target="_blank" rel="noopener noreferrer">https://nextjs-mz-tmdb-web.netlify.app</a>** — Browse movies, TV shows, cast, crew and photos.

| Zone | Status |
|---|---|
| Web (Orchestrator) | [![Netlify Status](https://api.netlify.com/api/v1/badges/aee1513f-4a9d-4c3b-ac9e-2e0aae514842/deploy-status)](https://app.netlify.com/projects/nextjs-mz-tmdb-web/deploys) |
| Home | [![Netlify Status](https://api.netlify.com/api/v1/badges/8067b380-5056-446a-8bf5-4fa00379a80a/deploy-status)](https://app.netlify.com/projects/nextjs-mz-tmdb-home/deploys) |
| Media | [![Netlify Status](https://api.netlify.com/api/v1/badges/af3acb46-1f93-4520-90da-3168f49163fc/deploy-status)](https://app.netlify.com/projects/nextjs-mz-tmdb-media/deploys) |

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
- [CI/CD](#cicd)
- [Netlify](#netlify)

## Why This Project

### The Problem with Micro-Frontends (Module Federation)

The [legacy project](https://github.com/fubaritico/vite-mf-monorepo) used **Vite Module Federation** — runtime-loaded remote apps sharing React, Router, and Query libraries via a shell host. This approach delivered team autonomy and independent deployments, but came with significant trade-offs:

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

[⬆ Back to top](#table-of-contents)

---

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

[⬆ Back to top](#table-of-contents)

---

## Zone Structure

| Zone | Port | Prefix | Responsibility |
|---|---|---|---|
| `apps/web` | 3000 | — | Orchestrator + rewrites (no UI) |
| `apps/home` | 3001 | `hm:` | Landing, Trending, Popular, FreeToWatch, Featured Actors |
| `apps/media` | 3002 | `mda:` | Movie/TV detail, Cast, Crew, Photos |
| `apps/talents` | 3003 | `tl:` | Actor/Director detail, Filmography, Photos |
| `apps/search` | 3004 | `sr:` | Search, Filters, Advanced Discovery |

[⬆ Back to top](#table-of-contents)

---

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

[⬆ Back to top](#table-of-contents)

---

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

[⬆ Back to top](#table-of-contents)

---

## Development

### Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all zones in parallel (Turborepo) |
| `pnpm build` | Build all zones (with Turborepo caching) |
| `pnpm lint` | ESLint across all zones |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm type-check` | TypeScript no-emit check |
| `pnpm start` | Start all zones in production mode (requires `pnpm build` first) |
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

[⬆ Back to top](#table-of-contents)

---

## Shared Packages

All UI and utility packages are consumed from npm (published from the legacy [vite-mf-monorepo](https://github.com/fubaritico/vite-mf-monorepo) project):

| Package | Contents |
|---|---|
| `@vite-mf-monorepo/ui` | Design system — Avatar, Badge, Button, Card, Carousel, Icon, Image, Modal, Rating, Skeleton, Spinner, Tabs, Typography, MovieCard, HeroImage |
| `@vite-mf-monorepo/layouts` | Container, Section, Header, Footer, RootLayout |
| `@vite-mf-monorepo/shared` | Mocks, test-utils, utilities (tmdbImage, etc.) |
| `@fubar-it-co/tmdb-client` | TMDB heyAPI generated client + TanStack Query option factories |

> To update a package: edit in vite-mf-monorepo, republish to npm, bump version here.

[⬆ Back to top](#table-of-contents)

---

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

[⬆ Back to top](#table-of-contents)

---

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

[⬆ Back to top](#table-of-contents)

---

## CI/CD

### Continuous Integration

Every push to `main` or `develop` (and PRs targeting them) triggers the **CI** workflow:

1. **lint** — ESLint across all zones
2. **type-check** — TypeScript `--noEmit` across all zones
3. **test** — Vitest per zone via Turborepo
4. **build** — Full production build (runs after lint, type-check, test pass)

All steps use a shared **setup action** (`.github/actions/setup`) that installs pnpm 10.7.1, Node 22, and runs `pnpm install --frozen-lockfile`.

### Deployment (Netlify)

Each zone deploys independently to its own Netlify site. Deploy workflows trigger via `workflow_run` — they only run after CI passes on `main`:

| Workflow | Zone | Netlify Site | Path Filter |
|---|---|---|---|
| `deploy-web.yml` | `apps/web` | `NETLIFY_SITE_ID_WEB` | `apps/web/**` |
| `deploy-home.yml` | `apps/home` | `NETLIFY_SITE_ID_HOME` | `apps/home/**` |
| `deploy-media.yml` | `apps/media` | `NETLIFY_SITE_ID_MEDIA` | `apps/media/**` |
| `deploy-talents.yml` | `apps/talents` | `NETLIFY_SITE_ID_TALENTS` | `apps/talents/**` |
| `deploy-search.yml` | `apps/search` | `NETLIFY_SITE_ID_SEARCH` | `apps/search/**` |

Deploys use `netlify deploy --build --prod` (OpenNext adapter builds Next.js output into serverless functions + edge functions + static assets).

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID_WEB` | Site ID for web orchestrator |
| `NETLIFY_SITE_ID_HOME` | Site ID for home zone |
| `NETLIFY_SITE_ID_MEDIA` | Site ID for media zone |
| `NETLIFY_SITE_ID_TALENTS` | Site ID for talents zone |
| `NETLIFY_SITE_ID_SEARCH` | Site ID for search zone |
| `VITE_TMDB_API_TOKEN` | TMDB API bearer token |
| `NEXT_PUBLIC_HOME_URL` | Production URL of home zone |
| `NEXT_PUBLIC_MEDIA_URL` | Production URL of media zone |
| `NEXT_PUBLIC_TALENTS_URL` | Production URL of talents zone |
| `NEXT_PUBLIC_SEARCH_URL` | Production URL of search zone |

[⬆ Back to top](#table-of-contents)

---

## Netlify

Each zone is deployed as a standalone Netlify site — no GitHub repo linking. Sites are created via CLI and deploys are triggered entirely from GitHub Actions.

### Site creation (one-time)

```bash
# Run from the monorepo root
netlify sites:create --name nextjs-mz-tmdb-web
netlify sites:create --name nextjs-mz-tmdb-home
netlify sites:create --name nextjs-mz-tmdb-media
netlify sites:create --name nextjs-mz-tmdb-talents
netlify sites:create --name nextjs-mz-tmdb-search
```

Copy each site ID into the corresponding GitHub secret (`NETLIFY_SITE_ID_WEB`, `NETLIFY_SITE_ID_HOME`, etc.).

### How it works

1. GitHub Actions builds the zone with `netlify deploy --build --prod` — the **OpenNext adapter** transforms `.next` output into serverless functions + edge functions + static assets
2. Each zone has a `netlify.toml` with build config and an `assetPrefix` redirect:
   ```toml
   [build]
     command = "next build"
     publish = ".next"

   [[redirects]]
     from = "/home-static/_next/*"
     to = "/_next/:splat"
     status = 200
   ```
3. The redirect is needed because `assetPrefix` (e.g. `/home-static`) makes HTML reference assets at `/home-static/_next/...`, but Netlify CDN serves them at `/_next/...`

### Multi-zone orchestration on Netlify

The orchestrator (`apps/web`) uses Next.js `rewrites()` to proxy requests to zone Netlify sites. The `NEXT_PUBLIC_*_URL` secrets must point to the production Netlify URLs of each zone:

| Secret | Example value |
|---|---|
| `NEXT_PUBLIC_HOME_URL` | `https://nextjs-mz-tmdb-home.netlify.app` |
| `NEXT_PUBLIC_MEDIA_URL` | `https://nextjs-mz-tmdb-media.netlify.app` |
| `NEXT_PUBLIC_TALENTS_URL` | `https://nextjs-mz-tmdb-talents.netlify.app` |
| `NEXT_PUBLIC_SEARCH_URL` | `https://nextjs-mz-tmdb-search.netlify.app` |

### Key differences from [legacy](https://github.com/fubaritico/vite-mf-monorepo)

The legacy project uses Vite + Module Federation with `netlify deploy --no-build` (pre-built `dist/` uploaded directly). This project uses Next.js + OpenNext, which requires Netlify to run its own build step to transform `.next` output into serverless/edge functions.

| Aspect | Legacy (Vite + MF) | New (Next.js Multi-Zones) |
|---|---|---|
| Build command | `pnpm prod` (Vite build) | `netlify deploy --build` (OpenNext) |
| Deploy method | `netlify deploy --prod --no-build` (pre-built dist) | `netlify deploy --build --prod` (OpenNext must run) |
| Asset handling | Static `dist/` folder | `assetPrefix` + redirect in `netlify.toml` |
| Orchestration | Module Federation runtime | HTTP rewrites via `NEXT_PUBLIC_*_URL` |

[⬆ Back to top](#table-of-contents)

---

## Claude Code + Legacy RAG

This project uses a local RAG system ([vite-mf-monorepo-rag](https://github.com/fubaritico/vite-mf-monorepo-rag)) to give Claude Code semantic access to the legacy codebase. Claude Code calls `recall("how was X implemented?")` and gets back the most relevant legacy code chunks — components, hooks, patterns, API calls — ranked by meaning.

### Prerequisites

- [vite-mf-monorepo-rag](https://github.com/fubaritico/vite-mf-monorepo-rag) cloned and set up (see its README)
- Ollama installed and running with `nomic-embed-text` pulled
- Legacy codebase indexed (`pnpm index` in `vite-mf-monorepo-rag`)

### First-time setup (once)

Run these steps once after cloning:

**1. Add the env variables for the RAG system** — create `.env.local` at the root of this project:
```
MONGODB_URI=mongodb+srv://...
LEGACY_PATH=/absolute/path/to/vite-mf-monorepo
```

**2. Generate `.mcp.json`:**
```bash
pnpm generate-mcp
```

**3. Register the MCP server with Claude Code:**
```bash
claude mcp add rag-legacy -s project -- pnpm --prefix /absolute/path/to/vite-mf-monorepo-rag run mcp
```

**4. Open Claude Code in this project** — accept `rag-legacy` when prompted.

`.mcp.json` is gitignored — regenerate it if credentials change (`pnpm generate-mcp`).

### Every session

1. Ollama is running (starts automatically at login)
2. Run `/mcp` in Claude Code — verify `rag-legacy` shows `connected`
3. Run `/start-session` — warms up the `recall` connection automatically

### Re-indexing

Run whenever the legacy codebase changes:
```bash
cd ../vite-mf-monorepo-rag && pnpm index
```

### How Claude Code uses it

Claude Code calls `recall` proactively before implementing any feature that may have a legacy equivalent — no manual intervention needed once connected.

[⬆ Back to top](#table-of-contents)

---
