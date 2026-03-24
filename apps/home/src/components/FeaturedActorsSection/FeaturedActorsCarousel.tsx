'use client'

import { personPopularListOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Talent,
} from '@vite-mf-monorepo/ui'
import Link from 'next/link'

import type {
  PersonPopularListResponse,
  TMDBError,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/**
 * Carousel displaying popular actors fetched from the TMDB person popular
 * endpoint.
 *
 * On first render this hits the prefetched cache seeded by the page Server
 * Component via `personPopularListOptions`, so `isLoading` is always `false`
 * and no spinner is shown.
 *
 * Each actor links to `/actor/{id}` in the talents zone.
 */
const FeaturedActorsCarousel: FC = () => {
  const { data, isLoading, error } = useQuery(
    personPopularListOptions()
  ) as UseQueryResult<PersonPopularListResponse, TMDBError>

  if (isLoading)
    return (
      <CarouselLoading
        count={6}
        cardWidth={120}
        cardHeight={180}
        showSubtitle={false}
      />
    )

  if (error ?? !data) {
    const errorMsg = error?.status_message ?? 'Failed to load featured actors'
    return <Carousel errorMessage={errorMsg} />
  }

  return (
    <Carousel rounded={false}>
      {data.results?.map((actor) => (
        <CarouselItem key={actor.id}>
          <Link href={`/actor/${String(actor.id)}`} className="hm:block">
            <Talent
              name={actor.name ?? 'Unknown'}
              role={actor.known_for_department ?? ''}
              imageSrc={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : undefined
              }
              variant="vertical"
            />
          </Link>
        </CarouselItem>
      ))}
    </Carousel>
  )
}

export default FeaturedActorsCarousel
