'use client'

import { movieCreditsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Talent,
  Typography,
} from '@vite-mf-monorepo/ui'

import type { MovieCreditsResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Maximum number of cast members to display. */
const MAX_CAST_DISPLAY = 20

/** Props for {@link MovieCastCarousel}. */
interface MovieCastCarouselProps {
  /** TMDB movie ID. */
  id: number
}

/**
 * Displays a carousel of cast members for a given movie.
 *
 * Calls `useQuery` with `movieCreditsOptions` — the same factory used by the
 * server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit on
 * first render (no loading flash).
 *
 * Returns `null` on error or when the cast list is empty (graceful
 * degradation matching legacy behavior).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB movie ID used to fetch credits.
 */
const MovieCastCarousel: FC<MovieCastCarouselProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    movieCreditsOptions({ path: { movie_id: id } })
  ) as UseQueryResult<MovieCreditsResponse>

  if (isLoading) {
    return (
      <CarouselLoading
        count={6}
        cardWidth={120}
        cardHeight={180}
        showSubtitle={false}
      />
    )
  }

  if (error ?? !data) return null

  const cast = data.cast?.slice(0, MAX_CAST_DISPLAY) ?? []

  if (cast.length === 0) return null

  return (
    <section data-testid="cast-section">
      <Typography variant="h2" className="mda:mb-4">
        Cast
      </Typography>
      <Carousel rounded={false}>
        {cast.map((member) => (
          <CarouselItem key={member.credit_id ?? member.id}>
            <a href={`/actor/${String(member.id)}`} className="mda:block">
              <Talent
                name={member.name ?? 'Unknown'}
                role={member.character ?? ''}
                imageSrc={
                  member.profile_path
                    ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                    : undefined
                }
                variant="vertical"
              />
            </a>
          </CarouselItem>
        ))}
      </Carousel>
    </section>
  )
}

export default MovieCastCarousel
