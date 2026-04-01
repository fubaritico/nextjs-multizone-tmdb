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
import { Container, Section } from '@vite-mf-monorepo/layouts'

import FreeToWatchSection from '../components/FreeToWatchSection/FreeToWatchSection'
import HeroSection from '../components/HeroSection/HeroSection'
import PopularSection from '../components/PopularSection/PopularSection'
import TrendingSection from '../components/TrendingSection/TrendingSection'
import { getBlurDataMap } from '../lib/blur'
import {
  CACHE_TIME_MS,
  DEFAULT_FREE_TO_WATCH_MEDIA_TYPE,
  DEFAULT_POPULAR_MEDIA_TYPE,
  DEFAULT_TRENDING_TIME_WINDOW,
} from '../types/home'

import type { MovieNowPlayingListResponse } from '@fubar-it-co/tmdb-client'
import type { Metadata } from 'next'

/** 24h ISR — must match CACHE_TIME_S from types/home.ts */
export const revalidate = 86400

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
/**
 * Creates a QueryClient and prefetches all data needed by the home page
 * sections in parallel. Returns the hydrated QueryClient.
 */
async function getQueryClient() {
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

  return queryClient
}

export default async function HomePage() {
  const queryClient = await getQueryClient()

  // Generate blur placeholders for hero backdrop images (LCP optimisation)
  const nowPlaying = queryClient.getQueryData<MovieNowPlayingListResponse>(
    movieNowPlayingListOptions().queryKey
  )
  const heroBlurMap = await getBlurDataMap(
    nowPlaying?.results?.slice(0, 6).map((m) => m.backdrop_path) ?? []
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Hero Section - Full width, no container */}
      <HeroSection heroBlurMap={heroBlurMap} />

      {/* Trending Section - White background */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <TrendingSection initialTimeWindow={DEFAULT_TRENDING_TIME_WINDOW} />
        </Section>
      </Container>

      {/* What's Popular Section - Gray background */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <PopularSection initialMediaType={DEFAULT_POPULAR_MEDIA_TYPE} />
        </Section>
      </Container>

      {/* Free to Watch Section - White background */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <FreeToWatchSection
            initialMediaType={DEFAULT_FREE_TO_WATCH_MEDIA_TYPE}
          />
        </Section>
      </Container>
    </HydrationBoundary>
  )
}
