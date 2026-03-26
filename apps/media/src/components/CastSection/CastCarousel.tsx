'use client'

import {
  movieCreditsOptions,
  tvSeriesCreditsOptions,
} from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Talent,
  Typography,
} from '@vite-mf-monorepo/ui'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Maximum number of cast members to display. */
const MAX_CAST_DISPLAY = 20

/** Props for {@link CastCarousel}. */
interface CastCarouselProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Displays a carousel of cast members for a movie or TV series.
 *
 * Branches the `useQuery` call based on `mediaType` — same factory as server prefetch.
 * Returns `null` on error or when the cast list is empty.
 */
const CastCarousel: FC<CastCarouselProps> = ({ id, mediaType }) => {
  const movieQuery = useQuery({
    ...movieCreditsOptions({ path: { movie_id: id } }),
    enabled: mediaType === 'movie',
  })

  const tvQuery = useQuery({
    ...tvSeriesCreditsOptions({ path: { series_id: id } }),
    enabled: mediaType === 'tv',
  })

  const { data, isLoading, error } =
    mediaType === 'movie' ? movieQuery : tvQuery

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

export default CastCarousel
