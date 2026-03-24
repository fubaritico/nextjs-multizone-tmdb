'use client'

import { discoverTvOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Carousel, CarouselItem, CarouselLoading } from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { DiscoverTvResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/**
 * Carousel of free-to-watch TV shows fetched from the TMDB discover endpoint
 * with `with_watch_monetization_types: 'free'`.
 *
 * On first render this hits the prefetched cache seeded by the page Server
 * Component, so `isLoading` is always `false` and no spinner is shown.
 */
const FreeToWatchTVCarousel: FC = () => {
  const { data, isLoading, error } = useQuery(
    discoverTvOptions({ query: { with_watch_monetization_types: 'free' } })
  ) as UseQueryResult<DiscoverTvResponse, TMDBError>

  if (isLoading) return <CarouselLoading count={6} />

  if (error ?? !data) {
    const errorMsg = error?.status_message ?? 'Failed to load'
    return <Carousel errorMessage={errorMsg} />
  }

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

export default FreeToWatchTVCarousel
