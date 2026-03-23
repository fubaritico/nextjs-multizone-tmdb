# Pattern — Server Component (Page / Layout)

## When to use
- `app/page.tsx` — route entry point, prefetches all data
- `app/layout.tsx` — wraps children, sets metadata shell
- Any component that only renders, has no interactivity, and fetches data

## Page pattern (with React Query prefetch)

```typescript jsx
// apps/home/src/app/page.tsx
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import {
  trendingAllOptions,
  moviePopularListOptions,
} from '@fubar-it-co/tmdb-client'

import HeroSection from '../components/HeroSection/HeroSection'
import TrendingSection from '../components/TrendingSection/TrendingSection'

import type { Metadata } from 'next'

export const revalidate = 86400 // 24h ISR

export const metadata: Metadata = {
  title: 'TMDB — Discover Movies & TV',
  description: 'Browse trending movies, popular TV shows and more.',
}

const DEFAULT_TIME_WINDOW = 'day' as const

export default async function HomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60 * 24, // 24h — must match revalidate
      },
    },
  })

  await Promise.all([
    queryClient.prefetchQuery(trendingAllOptions({ path: { time_window: DEFAULT_TIME_WINDOW } })),
    queryClient.prefetchQuery(moviePopularListOptions()),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HeroSection />
      <TrendingSection initialTimeWindow={DEFAULT_TIME_WINDOW} />
    </HydrationBoundary>
  )
}
```

## Layout pattern

```typescript
// apps/home/src/app/layout.tsx
import { RootLayout } from '@vite-mf-monorepo/layouts'

import type { ReactNode } from 'react'

interface HomeLayoutProps {
  children: ReactNode
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return <RootLayout>{children}</RootLayout>
}
```

## Dynamic metadata (detail pages)

```typescript jsx
// apps/media/src/app/movie/[id]/page.tsx
// Share the same QueryClient between generateMetadata and the page
// so the fetch is deduplicated — no double request to TMDB

import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { movieDetailsOptions } from '@fubar-it-co/tmdb-client'

import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

async function getQueryClient(id: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 1000 * 60 * 60 * 24 } },
  })
  await queryClient.prefetchQuery(
    movieDetailsOptions({ path: { movie_id: Number(id) } })
  )
  return queryClient
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const queryClient = await getQueryClient(id)
  const movie = queryClient.getQueryData(
    movieDetailsOptions({ path: { movie_id: Number(id) } }).queryKey
  ) as Awaited<ReturnType<typeof import('@fubar-it-co/tmdb-client').movieDetailsOptions>>

  return {
    title: `${movie?.title} | TMDB`,
    description: movie?.overview ?? '',
    openGraph: {
      title: movie?.title ?? '',
      description: movie?.overview ?? '',
      images: movie?.poster_path
        ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
        : [],
    },
  }
}

export default async function MediaPage({ params }: Props) {
  const { id } = await params
  const queryClient = await getQueryClient(id)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* sections */}
    </HydrationBoundary>
  )
}
```

> Note: Next.js deduplicates identical `fetch()` calls within a request, but sharing the `QueryClient` via a helper function is cleaner and guarantees a single TMDB call regardless.

## Rules
- Always use JSDocs to document Server Actions, functions, components, properties, interfaces, types, etc.
- No `'use client'` — Server Components are async by default
- No useState, no useEffect, no event handlers
- Always `await params` (Next.js 16 — params is a Promise)
- Prefetch ALL data needed by child sections in one `Promise.all`
- `staleTime` must match `revalidate` (both 24h)
- Always wrap with `<HydrationBoundary>` before passing to Client Components
