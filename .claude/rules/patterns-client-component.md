# Pattern — Client Component (Section with state / Carousel)

## When to use
- Component needs useState, useEffect, or event handlers
- Component uses useQuery (TanStack Query)
- Component has interactive UI: tabs, carousels, modals, buttons
- Always the leaf — never wrap Server Components inside Client Components

## Section with Tabs pattern

```typescript
// apps/home/src/components/TrendingSection/TrendingSection.tsx
'use client'

import { Tabs, Typography } from '@vite-mf-monorepo/ui'
import { useState } from 'react'

import TrendingMoviesCarousel from './TrendingMoviesCarousel'
import TrendingTVCarousel from './TrendingTVCarousel'

import type { FC } from 'react'

type TimeWindow = 'day' | 'week'

interface TrendingSectionProps {
  initialTimeWindow: TimeWindow
}

const TrendingSection: FC<TrendingSectionProps> = ({ initialTimeWindow }) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(initialTimeWindow)

  return (
    <div className="hm:flex hm:flex-col hm:gap-4">
      <Typography variant="h2">Trending</Typography>
      <Tabs
        value={timeWindow}
        onValueChange={(v) => setTimeWindow(v as TimeWindow)}
        variant="pills"
        prefix="trending"
      >
        <Tabs.List>
          <Tabs.Trigger value="day">Today</Tabs.Trigger>
          <Tabs.Trigger value="week">This Week</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="day">
          <TrendingMoviesCarousel timeWindow={timeWindow} />
        </Tabs.Panel>
        <Tabs.Panel value="week">
          <TrendingMoviesCarousel timeWindow={timeWindow} />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default TrendingSection
```

> ⚠️ **Pending migration**: `MovieCard` currently uses `to` prop (React Router). Once `@vite-mf-monorepo/ui` is republished with `next/link` support, this will change to `href`. Check `rules/patterns-ui.md` before using any component with a link prop.

## Carousel with useQuery pattern

```typescript
// apps/home/src/components/TrendingSection/TrendingMoviesCarousel.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { trendingAllOptions } from '@fubar-it-co/tmdb-client'
import { Carousel, CarouselItem, CarouselLoading, MovieCard } from '@vite-mf-monorepo/ui'

import type { UseQueryResult } from '@tanstack/react-query'
import type { TrendingAllResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { FC } from 'react'

interface TrendingMoviesCarouselProps {
  timeWindow: 'day' | 'week'
}

const TrendingMoviesCarousel: FC<TrendingMoviesCarouselProps> = ({ timeWindow }) => {
  const { data, isLoading, error } = useQuery(
    trendingAllOptions({ path: { time_window: timeWindow } })
  ) as UseQueryResult<TrendingAllResponse, TMDBError>

  if (isLoading) return <CarouselLoading count={6} />
  if (error || !data) return <Carousel errorMessage="Failed to load" />

  return (
    <Carousel rounded={false}>
      {data.results?.map((item) => (
        <CarouselItem key={item.id}>
          <div style={{ width: 150 }}>
            <MovieCard
              as="link"
              to={`/movie/${String(item.id)}`}
              id={item.id ?? 0}
              title={'title' in item ? (item.title ?? 'Unknown') : (item.name ?? 'Unknown')}
              posterUrl={item.poster_path ?? ''}
              voteAverage={item.vote_average ?? 0}
              year={
                'release_date' in item && item.release_date
                  ? new Date(item.release_date).getFullYear()
                  : null
              }
            />
          </div>
        </CarouselItem>
      ))}
    </Carousel>
  )
}

export default TrendingMoviesCarousel
```

## Rules
- `'use client'` at the very top of the file
- Always receive `initial*` props from Server Component parent for default state
- `useState(initialProp)` — never hardcode default state
- `useQuery` always uses the same options factory as the server's `prefetchQuery` → guaranteed cache HIT
- Always handle `isLoading` and `error` states
- Use `CarouselLoading` / `Skeleton` for loading states — prevents CLS
- Never fetch in a Server Component and pass data as props — use prefetch + useQuery instead
