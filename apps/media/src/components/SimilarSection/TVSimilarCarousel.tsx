'use client'

import { tvSeriesSimilarOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Typography,
} from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { TvSeriesSimilarResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Maximum number of similar TV series to display in the carousel. */
const MAX_SIMILAR_DISPLAY = 20

/** Props for {@link TVSimilarCarousel}. */
interface TVSimilarCarouselProps {
  /** TMDB TV series ID used to fetch similar series. */
  id: number
}

/**
 * Displays a carousel of TV series similar to a given series.
 *
 * Calls `useQuery` with `tvSeriesSimilarOptions` — the same factory used by
 * the server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit on
 * first render (no loading flash).
 *
 * Returns `null` on error or when the results list is empty (graceful
 * degradation — section is simply hidden rather than showing an error state).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB TV series ID used to fetch similar series.
 */
const TVSimilarCarousel: FC<TVSimilarCarouselProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    tvSeriesSimilarOptions({ path: { series_id: String(id) } })
  ) as UseQueryResult<TvSeriesSimilarResponse>

  if (isLoading) {
    return <CarouselLoading count={6} />
  }

  if (error ?? !data) return null

  const results = data.results?.slice(0, MAX_SIMILAR_DISPLAY) ?? []

  if (results.length === 0) return null

  return (
    <section data-testid="similar-section">
      <Typography variant="h2" className="mda:mb-4">
        Similar
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

export default TVSimilarCarousel
