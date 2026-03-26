# Session History — Completed Work

## Phase 1: Project Setup
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
- Turborepo + shared tsconfig (`turbo.json`, `tsconfig.base.json`, turbo scripts, `packageManager` field)
- Removed temp scaffolding (`src/app/*`, `next.config.ts`, `next/react/react-dom` deps)

## Phase 2: Zone Apps Init
- Init 5 zone apps (web:3000, home:3001, media:3002, talents:3003, search:3004)
- apps/web orchestrator with fallback rewrites to zone apps (env-driven URLs)
- Zone apps: next.config.ts, tsconfig.json, postcss.config.mjs, globals.css (Tailwind v4 prefix), layout.tsx, page.tsx
- assetPrefix per zone for multi-zone asset loading
- Fixed ESLint ignore patterns for monorepo (`**/.next/**`, `**/next-env.d.ts`)
- README.md with architecture docs, multi-zone vs micro-frontend comparison, env setup
- Fixed all package references to match catalog
- Updated Next.js version references from 15 to 16 across all docs

## Phase 3: Home Zone Foundation
- Shared package deps + TanStack Query provider + RootLayout
- Added deps: @tanstack/react-query, @fubar-it-co/tmdb-client, @vite-mf-monorepo/ui, layouts, shared, tokens, clsx, fonts
- Created QueryProvider client component (apps/home/src/providers/QueryProvider.tsx)
- Wired RootLayout from @vite-mf-monorepo/layouts/next into layout.tsx
- Updated globals.css: theme (bundled fonts+tokens), layouts styles, ui styles
- Bumped catalog: layouts 0.3.4, shared 0.0.3, added tokens 0.0.4
- Fixed .gitignore: **/.next/ for all zone apps, removed cached .next from git

## Migration Workflow Setup
- Multi-agent migration workflow: orchestrator.md (7-batch plan), dev.md (merged dev+reviewer+test-writer), scaffold-dev.md
- Shared deps added to media, talents, search (tanstack, ui, layouts, shared, tokens, clsx, fonts)
- Test infra (vitest.config.ts + vitest.setup.ts + passWithNoTests) added to all 4 zone apps
- Test devDeps added to all 4 zones (vitest, RTL, jest-dom, user-event)
- Workflow state files: `.workflow/state/shared-context.md`, `.workflow/state/task-log.json`

## Batch 1-3: Home Zone + Scaffolding (committed)
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

## Upstream: ui/next Exports (ui 0.2.0+)
- `ffb838f` refactor(home): migrate MovieCard imports to @vite-mf-monorepo/ui/next
- `117dc54` docs(claude): update rules for ui/next exports and remove resolved fix files
- Migrated all 5 carousel components from `to` prop → `href` prop (ui/next export)
- Removed react-router-dom mock from apps/home/vitest.setup.ts

## Home Zone Alignment with Legacy
- `6986c30` refactor(home): align HeroSection with legacy
- `0173e69` refactor(home): align page layout with legacy
- `fa5a349` refactor(home): import HeroImage from ui/next
- Upstream: @vite-mf-monorepo/ui — HeroImage /next variant published

## Image Optimization Strategy
- Decided: next/image for all zones
- Upstream: @vite-mf-monorepo/ui 0.4.0 published (NextImage, next/image in MovieCard+HeroImage)
- `4f74480` build(workspace): upgrade ui to 0.4.0 and add TMDB image remote patterns
- `553a329` docs(claude): update session state and add legacy-rag rule
- All 4 zone next.config.ts have images.remotePatterns for image.tmdb.org

## Workflow Optimization (pre-Batch 4)
- Analyzed home zone as implementation reference for media agents
- Decided Strategy B: separate Movie/TV variant components (no shared conditionals)
- Restructured tasks: removed M-3, merged M-5+M-6, moved M-7 to Batch 4

## Batch 4-6: Media Zone (committed)
- `82f2908` feat(media): add movie/tv detail pages with all sections and photo viewer
- 59 files, 5040 insertions — 126 media tests pass + 12 todo
- Batch 4: M-2 (layouts+slots), M-4 (MediaHero), M-5 (Synopsis+Crew), M-7 (Cast)
- Batch 5: M-8 (Similar), M-9 (Recommended), M-10 (Trailers), P-1 (PhotoViewer)
- Batch 6: M-11 (pages), P-2 (standalone photos), P-3 (modal photos), P-4 (BackdropSection)

## E2E Debugging: Multi-Zone Hydration
- `c9b0b31` fix(workspace): switch to path-based assetPrefix and expose TMDB env var
- `5cd434a` chore(workspace): add CSS utilities and improve reset script
- Fixed: VITE_TMDB_API_TOKEN client-side, images 404, hydration through orchestrator
- Root cause: full-URL assetPrefix breaks hydration — switched to path-based
- Upstream: ui 0.4.10 (per-file build), tmdb-client 0.0.14 (env var fix)

## P-5: MediaHero + Cross-Zone Navigation
- `57baca5` fix(media): align MediaHero with legacy layout and fix height collapse
- `6b6e419` fix(workspace): use plain anchors for cross-zone navigation
- Fixed hero-height collapse (next/image fill vs legacy flow-based img)
- Fixed cross-zone nav: next/link hangs → use `<a>` or `as="zone-link"`
- Upstream: ui 0.4.12 (`as="zone-link"`), layouts 0.4.4 (`crossZoneHome` prop)