'use client'

import { trendingAllOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Carousel, CarouselItem, CarouselLoading } from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { TimeWindow } from '@/types/home'
import type { TrendingAllResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** A single item returned in the trending results array. */
type TrendingItem = NonNullable<
  NonNullable<TrendingAllResponse>['results']
>[number]

/** Props for {@link TrendingCarousel}. */
interface TrendingCarouselProps {
  /** Time window for which to fetch trending content. */
  timeWindow: TimeWindow
}

/**
 * Carousel that displays trending movies and TV shows for a given time window.
 *
 * Calls `useQuery` with the same `trendingAllOptions` factory used by the
 * server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit on
 * first render (no loading flash for the initial tab).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param timeWindow - `'day'` or `'week'` — determines which TMDB endpoint
 *   results are displayed.
 */
const TrendingCarousel: FC<TrendingCarouselProps> = ({ timeWindow }) => {
  const { data, isLoading, error } = useQuery(
    trendingAllOptions({ path: { time_window: timeWindow } })
  ) as UseQueryResult<TrendingAllResponse>

  if (isLoading) return <CarouselLoading count={6} />

  if (error ?? !data) {
    return <Carousel errorMessage="Failed to load trending content" />
  }

  return (
    <Carousel rounded={false}>
      {data.results?.map((item: TrendingItem) => (
        <CarouselItem key={item.id}>
          <div style={{ width: 150 }}>
            <MovieCard
              as="link"
              href={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${String(item.id)}`}
              id={item.id ?? 0}
              title={item.title ?? 'Unknown'}
              posterUrl={item.poster_path ?? ''}
              voteAverage={item.vote_average ?? 0}
              year={
                item.release_date
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

export default TrendingCarousel
