'use client'

import { movieRecommendationsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Typography,
} from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { MovieSimilarResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Maximum number of recommended movies to display. */
const MAX_RESULTS = 20

/** Props for {@link MovieRecommendedCarousel}. */
interface MovieRecommendedCarouselProps {
  /** TMDB movie ID. */
  id: number
}

/**
 * Carousel that displays recommended movies for a given movie.
 *
 * Calls `useQuery` with `movieRecommendationsOptions` — the same factory used
 * by the server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit
 * on first render (no loading flash).
 *
 * Returns `null` on error or when the recommendations list is empty (graceful
 * degradation).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB movie ID used to fetch recommendations.
 */
const MovieRecommendedCarousel: FC<MovieRecommendedCarouselProps> = ({
  id,
}) => {
  const { data, isLoading, error } = useQuery(
    movieRecommendationsOptions({ path: { movie_id: id } })
  ) as UseQueryResult<MovieSimilarResponse>

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
                href={`/movie/${String(item.id)}`}
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
    </section>
  )
}

export default MovieRecommendedCarousel
