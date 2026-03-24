# Pattern — Testing (Vitest + RTL + MSW)

## Philosophy
- **Real UI components** — never mock `@vite-mf-monorepo/ui` or `@vite-mf-monorepo/layouts`
- **MSW for API calls** — intercept HTTP requests at the network level, not by mocking hooks
- **Shared mock data** — all fixtures come from `@vite-mf-monorepo/shared/mocks`
- **Shared test-utils** — use `renderWithReactQuery` from `@vite-mf-monorepo/shared/test-utils`
- **Only mock what's external to React** — `next/link`, `next/image`, `next/navigation`

## Setup

### vitest.setup.ts
```typescript
import '@testing-library/jest-dom/vitest'
import { setupBrowserMocks } from '@vite-mf-monorepo/shared/mocks'

setupBrowserMocks()
```

### vitest.config.ts
```typescript
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    passWithNoTests: true,
  },
})
```

## Available mock data (`@vite-mf-monorepo/shared/mocks`)

| Export | Shape | Count |
|---|---|---|
| `mockNowPlayingMovies` | `{ results: Movie[] }` | 6 |
| `mockTrendingDay` | `{ results: TrendingItem[] }` | 6 |
| `mockTrendingWeek` | `{ results: TrendingItem[] }` | 6 |
| `mockPopularMovies` | `{ results: Movie[] }` | 6 |
| `mockPopularTV` | `{ results: TVShow[] }` | 6 |
| `mockFreeToWatchMovies` | `{ results: Movie[] }` | 6 |
| `mockFreeToWatchTV` | `{ results: TVShow[] }` | 6 |

## Available MSW handlers (`@vite-mf-monorepo/shared/mocks`)

Each handler set is an object with named variants:

```typescript
nowPlayingHandlers.nowPlayingMovies        // success
nowPlayingHandlers.nowPlayingMoviesLoading  // infinite pending
nowPlayingHandlers.nowPlayingMoviesError    // 500

trendingHandlers.trendingDay               // success (day)
trendingHandlers.trendingWeek              // success (week)
trendingHandlers.trendingDayLoading
trendingHandlers.trendingDayError
trendingHandlers.trendingWeekError

popularHandlers.popularMovies              // success
popularHandlers.popularTV                  // success
popularHandlers.popularMoviesLoading
popularHandlers.popularTVLoading
popularHandlers.popularMoviesError
popularHandlers.popularTVError

freeToWatchHandlers.freeToWatchMovies      // success
freeToWatchHandlers.freeToWatchTV           // success
freeToWatchHandlers.freeToWatchMoviesLoading
freeToWatchHandlers.freeToWatchMoviesError
freeToWatchHandlers.freeToWatchTVLoading
freeToWatchHandlers.freeToWatchTVError
```

## Available test-utils (`@vite-mf-monorepo/shared/test-utils`)

| Export | Description |
|---|---|
| `createTestQueryClient()` | `QueryClient` with `retry: false` |
| `ReactQueryWrapper` | Provider wrapper component |
| `renderWithReactQuery(ui, options?)` | `render()` wrapped with `ReactQueryWrapper` |
| `renderWithRouter(ui, options?)` | `render()` wrapped with React Router (legacy only) |
| `renderComponentWithRouter(ui, options?)` | variant of above |
| `renderReactQueryWithRouter(ui, options?)` | both wrappers (legacy only) |

For Next.js zone tests, use `renderWithReactQuery` — no React Router needed.

## Client Component test (carousel with MSW)

```typescript
import { screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  mockTrendingDay,
  trendingHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'

import TrendingCarousel from './TrendingCarousel'

// Mock Next.js modules (only external-to-React dependencies)
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

const server = setupServer()

beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }) })
afterEach(() => { server.resetHandlers() })
afterAll(() => { server.close() })

describe('TrendingCarousel', () => {
  it('renders movie titles from mock data', async () => {
    server.use(trendingHandlers.trendingDay)

    renderWithReactQuery(<TrendingCarousel timeWindow="day" />)

    await waitFor(() => {
      expect(screen.getByText(mockTrendingDay.results[0].title)).toBeInTheDocument()
    })
  })
})
```

## Section test (tabs + child carousels)

Section tests render the real section component with real UI (Tabs, Typography).
MSW handlers supply data for the child carousels.

```typescript
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { trendingHandlers } from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'

import TrendingSection from './TrendingSection'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

const server = setupServer()

beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }) })
afterEach(() => { server.resetHandlers() })
afterAll(() => { server.close() })

describe('TrendingSection', () => {
  it('renders the section heading', async () => {
    server.use(trendingHandlers.trendingDay, trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingSection />)

    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('switches tabs', async () => {
    const user = userEvent.setup()
    server.use(trendingHandlers.trendingDay, trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingSection />)

    await user.click(screen.getByRole('tab', { name: /this week/i }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /this week/i })).toHaveAttribute(
        'aria-selected', 'true'
      )
    })
  })
})
```

## Server Component test (page.tsx)

Server Components are async functions. Call directly, render the returned JSX.
Mock `@tanstack/react-query` to stub `prefetchQuery`. Mock child sections to isolate.

```typescript
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    QueryClient: vi.fn().mockImplementation(() => ({
      prefetchQuery: vi.fn().mockResolvedValue(undefined),
      getDefaultOptions: vi.fn().mockReturnValue({}),
    })),
    dehydrate: vi.fn().mockReturnValue({}),
    HydrationBoundary: ({ children }: { children: React.JSX.Element }) => <>{children}</>,
  }
})

vi.mock('../components/HeroSection/HeroSection', () => ({
  default: () => <section data-testid="hero-section" />,
}))

import HomePage from './page'

describe('HomePage', () => {
  it('renders without throwing', async () => {
    const jsx = await HomePage()
    render(jsx)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })
})
```

## Rules

### Never mock
- `@vite-mf-monorepo/ui` — render real components
- `@vite-mf-monorepo/layouts` — render real Section/Container
- `@tanstack/react-query` (in client component tests) — MSW handles the fetch layer
- `@fubar-it-co/tmdb-client` (in client component tests) — let option factories run, MSW intercepts

### Always mock
- `next/link` → plain `<a>` element
- `next/image` → plain `<img>` element
- `next/navigation` → if `useRouter`/`usePathname` is used

### Mock only in Server Component tests
- `@tanstack/react-query` — stub `QueryClient`/`prefetchQuery`/`dehydrate`/`HydrationBoundary`
- Child section components — isolate page shell from section internals

### MSW setup
- `setupServer()` from `msw/node` (not `msw/browser`)
- `beforeAll` → `server.listen({ onUnhandledRequest: 'error' })`
- `afterEach` → `server.resetHandlers()`
- `afterAll` → `server.close()`
- Use `server.use()` per test to set the right handler variant

### Assertions
- `getByRole` preferred over `getByText` — mirrors accessibility
- `getByText` for content assertions (movie titles, section headings)
- `waitFor` for async data — MSW responds asynchronously
- Assert against shared mock data values, never hardcoded strings
- `userEvent.setup()` for interactions — never `fireEvent`

### File structure
- Co-located: `Component.test.tsx` next to `Component.tsx`
- Imports: vitest → RTL → MSW → shared mocks → shared test-utils → component under test