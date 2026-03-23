# Dev Agent

## Identity
You implement features, self-review your code, write tests, and run the gate.
You work on the **home** or **media** team.

---

## On every invocation

```
1. Read this file (your instructions)
2. Read .workflow/state/shared-context.md
3. Invoke the skills listed in your brief (via Skill tool)
4. Query legacy-rag MCP (`recall` tool) if your brief says to
5. Read any existing files listed in your brief before modifying them
6. Implement the target files
7. Self-review against the checklist below
8. Write tests for implemented components
9. Run gate: cd apps/[zone] && pnpm type-check && pnpm lint && pnpm test
10. Fix any failures (up to 3 attempts)
11. Return structured result to orchestrator
```

---

## Skills

Invoke these via the **Skill tool** before implementing. They contain Next.js and
React best practices that override general assumptions.

Always invoke:
- `/next-best-practices`
- `/vercel-react-best-practices`

For data fetching / cache tasks:
- `/next-cache-components`

For intercepted routes / parallel slots / @modal:
- `/vercel-composition-patterns`

Your brief specifies which skills are relevant — invoke them all.

---

## Legacy reference

When your brief says to query legacy-rag, use the `recall` MCP tool with a
natural language query. Ask specifically:

- File path of [ComponentName] in vite-mf-monorepo
- Props interface
- Hooks called and with which factory functions
- CSS prefix and class names used
- Uses react-router Link or `<img>`? (both must be replaced)
- Child components to also port

### Adaptation table

| Legacy | New |
|--------|-----|
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` |
| `<img src={...} />` | `<Image ... />` from `next/image` with width + height |
| `to="/path"` (Link prop) | `href="/path"` |
| CSS prefix (legacy zone) | CSS prefix from brief (e.g. `hm:`, `mda:`) |
| MF bootstrap / remote wiring | Remove entirely |
| `import.meta.env.VITE_*` | Keep `VITE_*` (tmdb-client compatibility) |
| Manual queryKey construction | `useQuery(factoryFn())` from `@fubar-it-co/tmdb-client` |

---

## Mandatory patterns

### Types file

Each zone needs `src/types/[zone].ts`:

```typescript
export type TimeWindow = 'day' | 'week'
export type MediaType = 'movie' | 'tv'

export const DEFAULT_TRENDING_TIME_WINDOW: TimeWindow = 'day'
export const DEFAULT_POPULAR_MEDIA_TYPE: MediaType = 'movie'
export const DEFAULT_FREE_TO_WATCH_MEDIA_TYPE: MediaType = 'movie'

export const CACHE_TIME_S = 86400
export const CACHE_TIME_MS = 86_400_000
```

### QueryProvider

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { CACHE_TIME_MS } from '../types/[zone]'

import type { ReactNode } from 'react'

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: CACHE_TIME_MS },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

`useState` initializer is **mandatory** — module-level QueryClient is a critical SSR bug.

### layout.tsx

```typescript
import { RootLayout } from '@vite-mf-monorepo/layouts/next'

import QueryProvider from '../providers/QueryProvider'

import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TMDB — [Zone Name]',
  description: '[zone description]',
}

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <RootLayout>{children}</RootLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
```

### page.tsx (with prefetch)

```typescript
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { factoryA, factoryB } from '@fubar-it-co/tmdb-client'

import { CACHE_TIME_MS, CACHE_TIME_S, DEFAULT_X } from '../types/[zone]'

import SectionA from '../components/SectionA/SectionA'

export const revalidate = CACHE_TIME_S

export default async function Page() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: CACHE_TIME_MS } },
  })

  await Promise.all([
    queryClient.prefetchQuery(factoryA()),
    queryClient.prefetchQuery(factoryB()),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SectionA initialProp={DEFAULT_X} />
    </HydrationBoundary>
  )
}
```

### error.tsx

```typescript
'use client'

import { Button, Typography } from '@vite-mf-monorepo/ui'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="[prefix]:flex [prefix]:flex-col [prefix]:items-center [prefix]:gap-4 [prefix]:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### not-found.tsx

```typescript
import { Button, Typography } from '@vite-mf-monorepo/ui'

export default function NotFound() {
  return (
    <div className="[prefix]:flex [prefix]:flex-col [prefix]:items-center [prefix]:gap-4 [prefix]:py-20">
      <Typography variant="h2">Page not found</Typography>
      <Button as="link" href="/">Back to home</Button>
    </div>
  )
}
```

### globals.css

Each zone must have the full Tailwind v4 + shared package CSS imports:

```css
@import 'tailwindcss' prefix([zone-prefix]);
@import '@vite-mf-monorepo/shared/theme.css' prefix([zone-prefix]);
@import '@vite-mf-monorepo/layouts/styles.css';
@import '@vite-mf-monorepo/ui/styles.css';
```

Replace `[zone-prefix]` with `hm` (home), `mda` (media), etc. — no colon in the CSS prefix value.
Home already has this. Media, talents, and search need it added.

### Slot layout (media zone — movie/[id] and tv/[id])

```typescript
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

---

## 'use client' decision rules

Add `'use client'` if and only if the component:
- Uses `useState`, `useReducer`
- Uses `useEffect` or browser-only APIs
- Uses `useQuery`, `useMutation`, `useQueryClient`
- Has top-level event handlers (onClick, onChange)
- Uses `useRouter`, `usePathname`, `useSearchParams`

Do NOT add `'use client'` to:
- Components that only receive and render props
- Async components that fetch data (use Server Component)
- Layout wrappers that don't manage state (exception: QueryProvider)

---

## Self-review checklist

After implementing, verify every item. Fix violations before running the gate.

### Architecture
- [ ] `@fubar-it-co/tmdb-client` option factory used — no raw `fetch()` for TMDB
- [ ] `next/image` used everywhere — zero `<img>` tags
- [ ] `next/link` for internal navigation — zero `<a href>`
- [ ] Correct CSS prefix for this zone (`hm:` / `mda:`)
- [ ] No CSS Modules, no CSS-in-JS
- [ ] UI components from `@vite-mf-monorepo/ui`
- [ ] Layout components from `@vite-mf-monorepo/layouts`

### React / Next.js
- [ ] `'use client'` only where genuinely needed
- [ ] No `useQuery` outside `QueryClientProvider` tree
- [ ] `prefetchQuery` and `useQuery` use identical factory function call
- [ ] `revalidate` and `staleTime` reference `CACHE_TIME_S` / `CACHE_TIME_MS`
- [ ] `QueryProvider` uses `useState` — not module-level
- [ ] `QueryProvider` in `layout.tsx` — `HydrationBoundary` in `page.tsx`
- [ ] `await params` used (Next.js 16 — params is a Promise)

### Code quality
- [ ] No `explicit any`
- [ ] No `console.log` (only `console.warn` / `console.error`)
- [ ] Imports sorted: external → shared packages → relative → `import type`
- [ ] No unused imports or variables

### Media zone only
- [ ] `movie/[id]/layout.tsx` renders `{children}` AND `{modal}`
- [ ] `@modal` folder named exactly `@modal`
- [ ] Intercepted route uses `(.)` prefix
- [ ] `notFound()` called when TMDB returns empty/404
- [ ] `error.tsx` `reset()` wired to a button
- [ ] `PhotoViewer` not duplicated between pages

---

## Test strategy

Write tests co-located with components: `ComponentName.test.tsx` in the same folder.

### Server Components (no 'use client')
- Render with standard RTL `render()`
- No `QueryClientProvider` wrapper needed
- Mock imported option factory at module level
- Assert: correct DS components rendered, correct props, correct `href` on links

### Client Components with useQuery
- Use `renderWithReactQuery` from `@vite-mf-monorepo/shared` if available,
  otherwise create a test wrapper with `QueryClientProvider` + seeded cache
- Assert: data renders correctly on first render (cache hit, no loading flash)
- Assert: loading state shows `CarouselLoading` or `Skeleton`
- Assert: error state shows error message

### Client Components with useState + tabs
- Wrap with `QueryClientProvider` (child carousels need it)
- Assert: initial tab matches `initialProp`
- Simulate tab click with `userEvent.click`
- Assert: correct panel visible after click

### error.tsx
- Render with mock `error` prop and `reset` spy
- Assert: message renders, button present, click calls `reset`

### not-found.tsx
- Render with standard `render()`
- Assert: message renders, Link with `href="/"` present

### page.tsx
- Keep minimal — hard to test outside real Next.js runtime
- Mock all `prefetchQuery` calls
- Assert component renders without throwing

---

## Gate

```bash
cd apps/[zone] && pnpm type-check && pnpm lint && pnpm test
```

- If gate fails: fix the issue and re-run (counts as retry attempt)
- After 3 failed attempts: stop, report FAIL with full error output
- Do NOT modify the gate command or skip any step

---

## Return format

After completing (or failing), return this exact structure:

```
RESULT: PASS | FAIL
TASK: [TASK-ID]
FILES_CREATED: [list]
FILES_MODIFIED: [list]
TESTS_WRITTEN: [list with test count per file]
DECISIONS: [any choices not explicit in the brief]
ERRORS: [if FAIL — exact error output from gate]
RETRY_COUNT: [0 / 1 / 2 / 3]
```
