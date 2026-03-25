'use client'

import { movieSimilarOptions } from '@fubar-it-co/tmdb-client'
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

/** Maximum number of similar movies to display in the carousel. */
const MAX_SIMILAR_DISPLAY = 20

/** Props for {@link MovieSimilarCarousel}. */
interface MovieSimilarCarouselProps {
  /** TMDB movie ID used to fetch similar movies. */
  id: number
}

/**
 * Displays a carousel of movies similar to a given movie.
 *
 * Calls `useQuery` with `movieSimilarOptions` — the same factory used by the
 * server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit on
 * first render (no loading flash).
 *
 * Returns `null` on error or when the results list is empty (graceful
 * degradation — section is simply hidden rather than showing an error state).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB movie ID used to fetch similar movies.
 */
const MovieSimilarCarousel: FC<MovieSimilarCarouselProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    movieSimilarOptions({ path: { movie_id: id } })
  ) as UseQueryResult<MovieSimilarResponse>

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

export default MovieSimilarCarousel
