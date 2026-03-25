'use client'

import { tvSeriesRecommendationsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Typography,
} from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { TvSeriesRecommendationsResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Maximum number of recommended TV series to display. */
const MAX_RESULTS = 20

/** Props for {@link TVRecommendedCarousel}. */
interface TVRecommendedCarouselProps {
  /** TMDB TV series ID. */
  id: number
}

/**
 * Carousel that displays recommended TV series for a given series.
 *
 * Calls `useQuery` with `tvSeriesRecommendationsOptions` — the same factory
 * used by the server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache
 * hit on first render (no loading flash).
 *
 * Returns `null` on error or when the recommendations list is empty (graceful
 * degradation).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB TV series ID used to fetch recommendations.
 */
const TVRecommendedCarousel: FC<TVRecommendedCarouselProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    tvSeriesRecommendationsOptions({ path: { series_id: id } })
  ) as UseQueryResult<TvSeriesRecommendationsResponse>

  if (isLoading) {
    return <CarouselLoading count={6} />
  }

  if (error ?? !data) return null

  const results = data.results?.slice(0, MAX_RESULTS) ?? []

  if (results.length === 0) return null

  return (
    <section data-testid="recommended-section">
      <Typography variant="h2" className="mda:mb-4">
        Recommended
      </Typography>
      <Carousel rounded={false}>
        {results.map((item) => (
          <CarouselItem key={item.id}>
            <div style={{ width: 150 }}>
              <MovieCard
                as="link"
                href={`/tv/${String(item.id)}`}
                id={item.id ?? 0}
                title={item.name ?? 'Unknown'}
                posterUrl={item.poster_path ?? ''}
                voteAverage={item.vote_average ?? 0}
                year={
                  item.first_air_date
                    ? new Date(item.first_air_date).getFullYear()
                    : null
                }
              />
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </section>
  )
}

export default TVRecommendedCarousel
