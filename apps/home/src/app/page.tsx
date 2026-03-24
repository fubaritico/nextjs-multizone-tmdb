import {
  discoverMovieOptions,
  discoverTvOptions,
  movieNowPlayingListOptions,
  moviePopularListOptions,
  trendingAllOptions,
  tvSeriesPopularListOptions,
} from '@fubar-it-co/tmdb-client'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import FreeToWatchSection from '../components/FreeToWatchSection/FreeToWatchSection'
import HeroSection from '../components/HeroSection/HeroSection'
import PopularSection from '../components/PopularSection/PopularSection'
import TrendingSection from '../components/TrendingSection/TrendingSection'
import {
  CACHE_TIME_MS,
  CACHE_TIME_S,
  DEFAULT_FREE_TO_WATCH_MEDIA_TYPE,
  DEFAULT_POPULAR_MEDIA_TYPE,
  DEFAULT_TRENDING_TIME_WINDOW,
} from '../types/home'

import type { Metadata } from 'next'

export const revalidate = CACHE_TIME_S

export const metadata: Metadata = {
  title: 'TMDB — Discover Movies & TV',
  description: 'Browse trending movies, popular TV shows and more.',
}

/**
 * Home page — server component that prefetches all initial data in parallel
 * and hydrates the TanStack Query cache before passing control to client
 * section components.
 *
 * Each `prefetchQuery` call uses the exact same options factory as the
 * corresponding `useQuery` in the child carousel component, guaranteeing
 * an identical `queryKey` and a cache HIT on first render (no loading flash,
 * no client-side waterfall).
 *
 * ISR `revalidate` and TanStack Query `staleTime` are both sourced from the
 * same `CACHE_TIME_*` constants so they never drift apart.
 */
export default async function HomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: CACHE_TIME_MS },
    },
  })

  await Promise.all([
    queryClient.prefetchQuery(movieNowPlayingListOptions()),
    queryClient.prefetchQuery(
      trendingAllOptions({
        path: { time_window: DEFAULT_TRENDING_TIME_WINDOW },
      })
    ),
    queryClient.prefetchQuery(moviePopularListOptions()),
    queryClient.prefetchQuery(tvSeriesPopularListOptions()),
    queryClient.prefetchQuery(
      discoverMovieOptions({ query: { with_watch_monetization_types: 'free' } })
    ),
    queryClient.prefetchQuery(
      discoverTvOptions({ query: { with_watch_monetization_types: 'free' } })
    ),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HeroSection />
      <TrendingSection initialTimeWindow={DEFAULT_TRENDING_TIME_WINDOW} />
      <PopularSection initialMediaType={DEFAULT_POPULAR_MEDIA_TYPE} />
      <FreeToWatchSection initialMediaType={DEFAULT_FREE_TO_WATCH_MEDIA_TYPE} />
    </HydrationBoundary>
  )
}
