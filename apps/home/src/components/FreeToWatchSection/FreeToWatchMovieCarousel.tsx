'use client'

import { discoverMovieOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Carousel, CarouselItem, CarouselLoading } from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { DiscoverMovieResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/**
 * Carousel of free-to-watch movies fetched from the TMDB discover endpoint
 * with `with_watch_monetization_types: 'free'`.
 *
 * On first render this hits the prefetched cache seeded by the page Server
 * Component, so `isLoading` is always `false` and no spinner is shown.
 */
const FreeToWatchMovieCarousel: FC = () => {
  const { data, isLoading, error } = useQuery(
    discoverMovieOptions({ query: { with_watch_monetization_types: 'free' } })
  ) as UseQueryResult<DiscoverMovieResponse, TMDBError>

  if (isLoading) return <CarouselLoading count={6} />

  if (error ?? !data) {
    const errorMsg = error?.status_message ?? 'Failed to load'
    return <Carousel errorMessage={errorMsg} />
  }

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

export default FreeToWatchMovieCarousel
