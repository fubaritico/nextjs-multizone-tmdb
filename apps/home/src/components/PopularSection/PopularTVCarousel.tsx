'use client'

import { tvSeriesPopularListOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Carousel, CarouselItem, CarouselLoading } from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { TvSeriesPopularListResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/**
 * PopularTVCarousel fetches and displays the TMDB popular TV series list.
 *
 * Uses the same `tvSeriesPopularListOptions` factory as the server-side
 * `prefetchQuery` in page.tsx — guaranteeing a cache HIT on first render
 * (no loading flash, no waterfall).
 *
 * @example
 * <PopularTVCarousel />
 */
const PopularTVCarousel: FC = () => {
  const { data, isLoading, error } = useQuery(
    tvSeriesPopularListOptions()
  ) as UseQueryResult<TvSeriesPopularListResponse>

  if (isLoading) return <CarouselLoading count={6} />
  if (error ?? !data)
    return <Carousel errorMessage="Failed to load popular TV shows" />

  return (
    <Carousel rounded={false}>
      {data.results?.map((show) => (
        <CarouselItem key={show.id}>
          <div style={{ width: 150 }}>
            <MovieCard
              as="link"
              href={`/tv/${String(show.id)}`}
              id={show.id ?? 0}
              title={show.name ?? 'Unknown'}
              posterUrl={show.poster_path ?? ''}
              voteAverage={show.vote_average ?? 0}
              year={
                show.first_air_date
                  ? new Date(show.first_air_date).getFullYear()
                  : null
              }
            />
          </div>
        </CarouselItem>
      ))}
    </Carousel>
  )
}

export default PopularTVCarousel
