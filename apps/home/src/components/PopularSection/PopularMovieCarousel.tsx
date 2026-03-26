'use client'

import { moviePopularListOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Carousel, CarouselItem, CarouselLoading } from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { MoviePopularListResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/**
 * PopularMovieCarousel fetches and displays the TMDB popular movies list.
 *
 * Uses the same `moviePopularListOptions` factory as the server-side
 * `prefetchQuery` in page.tsx — guaranteeing a cache HIT on first render
 * (no loading flash, no waterfall).
 *
 * @example
 * <PopularMovieCarousel />
 */
const PopularMovieCarousel: FC = () => {
  const { data, isLoading, error } = useQuery(
    moviePopularListOptions()
  ) as UseQueryResult<MoviePopularListResponse>

  if (isLoading) return <CarouselLoading count={6} />
  if (error ?? !data)
    return <Carousel errorMessage="Failed to load popular movies" />

  return (
    <Carousel rounded={false}>
      {data.results?.map((movie) => (
        <CarouselItem key={movie.id}>
          <div style={{ width: 150 }}>
            <MovieCard
              as="zone-link"
              href={`/movie/${String(movie.id)}`}
              id={movie.id ?? 0}
              title={movie.title ?? 'Unknown'}
              posterUrl={movie.poster_path ?? ''}
              voteAverage={movie.vote_average ?? 0}
              year={
                movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : null
              }
            />
          </div>
        </CarouselItem>
      ))}
    </Carousel>
  )
}

export default PopularMovieCarousel
