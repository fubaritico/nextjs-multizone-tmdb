# Pattern — Hydration (prefetchQuery + HydrationBoundary + useQuery)

## The full SSR → Client flow

```
Server (page.tsx)
  1. new QueryClient()
  2. await Promise.all([prefetchQuery(options), ...])   ← parallel, no waterfall
  3. dehydrate(queryClient)                             ← serialize cache to JSON
  4. <HydrationBoundary state={dehydratedState}>        ← inject into HTML stream

Client (section/carousel)
  5. HydrationBoundary.hydrate()                        ← rebuild cache from JSON
  6. useQuery(options)                                  ← queryKey match → cache HIT
  7. data available immediately, isLoading: false       ← no spinner, no refetch
```

## Complete example

### Server (page.tsx)
```typescript
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import {
  trendingAllOptions,
  moviePopularListOptions,
  tvSeriesPopularListOptions,
  discoverMovieOptions,
} from '@fubar-it-co/http-client'

import TrendingSection from '../components/TrendingSection/TrendingSection'
import PopularSection from '../components/PopularSection/PopularSection'

const DEFAULT_TIME_WINDOW = 'day' as const
const DEFAULT_MEDIA_TYPE = 'movie' as const

export const revalidate = 86400

export default async function HomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60 * 60 * 24 },
    },
  })

  await Promise.all([
    queryClient.prefetchQuery(
      trendingAllOptions({ path: { time_window: DEFAULT_TIME_WINDOW } })
    ),
    queryClient.prefetchQuery(moviePopularListOptions()),
    queryClient.prefetchQuery(tvSeriesPopularListOptions()),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrendingSection initialTimeWindow={DEFAULT_TIME_WINDOW} />
      <PopularSection initialMediaType={DEFAULT_MEDIA_TYPE} />
    </HydrationBoundary>
  )
}
```

### Client (carousel.tsx)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { trendingAllOptions } from '@fubar-it-co/http-client'

// SAME factory as prefetchQuery → same queryKey → cache HIT guaranteed
const { data, isLoading } = useQuery(
  trendingAllOptions({ path: { time_window: timeWindow } })
)
```

## Critical rules

### queryKey must be bit-for-bit identical
```typescript
// CORRECT — same factory function
const options = trendingAllOptions({ path: { time_window: 'day' } })
queryClient.prefetchQuery(options)  // server
useQuery(options)                    // client → HIT

// WRONG — manually constructed keys, different shape → MISS → extra fetch
queryClient.prefetchQuery({ queryKey: ['trending', { time_window: 'day' }], ... })
useQuery({ queryKey: ['trending', 'day'], ... })
```

### Prefetch ALL tab variants upfront
If a section has tabs (e.g. Movies / TV), prefetch both on the server:
```typescript
// Both tabs prefetched → tab switch is instant, no loading state
await Promise.all([
  queryClient.prefetchQuery(moviePopularListOptions()),
  queryClient.prefetchQuery(tvSeriesPopularListOptions()),
])
```

### staleTime must match revalidate
```typescript
// Keep these in sync — both represent "how long is this data fresh"
export const revalidate = 86400               // Next.js ISR: 24h in seconds
staleTime: 1000 * 60 * 60 * 24               // TanStack Query: 24h in ms
```

### One HydrationBoundary per page
Wrap at page level, not per-section. One dehydrated state covers all prefetched queries.

### Progressive enhancement
With `revalidate` + SSR, content is visible even with JavaScript disabled.
The `HydrationBoundary` makes the page interactive once JS loads.
