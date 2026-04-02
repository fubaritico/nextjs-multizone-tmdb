'use client'

import { Container, Section } from '@vite-mf-monorepo/layouts'
import { Skeleton, TrailerCard, Typography } from '@vite-mf-monorepo/ui'

import { useMediaVideos } from '@/hooks'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Maximum number of trailers to display. */
const MAX_TRAILERS = 3

/** Props for {@link TrailersSection}. */
interface TrailersSectionProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Displays up to 3 official YouTube trailers for a movie or TV series.
 *
 * Uses `useMediaVideos` hook matching the legacy conditional hook pattern.
 * Filters client-side for `type === 'Trailer' && site === 'YouTube' && official === true`.
 * Returns `null` when no qualifying trailers are found.
 */
const TrailersSection: FC<TrailersSectionProps> = ({ id, mediaType }) => {
  const { data, isLoading, error } = useMediaVideos(mediaType, id)

  if (isLoading) {
    return (
      <Container variant="default">
        <Section maxWidth="xl" spacing="lg" data-testid="trailers-section">
          <Typography variant="h2" className="mda:mb-6">
            Trailers
          </Typography>
          <div className="mda:grid mda:gap-4 mda:grid-cols-1 mda:md:grid-cols-2 mda:lg:grid-cols-3">
            {Array.from({ length: MAX_TRAILERS }).map((_, i) => (
              <Skeleton
                key={String(i) + '-trailer-skeleton'}
                className="mda:aspect-video mda:w-full mda:rounded-lg"
              />
            ))}
          </div>
        </Section>
      </Container>
    )
  }

  if (error ?? !data) return null

  const trailers = (data.results ?? [])
    .filter(
      (video) =>
        video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true &&
        video.key != null
    )
    .slice(0, MAX_TRAILERS)

  if (trailers.length === 0) return null

  return (
    <Container variant="default">
      <Section maxWidth="xl" spacing="lg" data-testid="trailers-section">
        <Typography variant="h2" className="mda:mb-6">
          Trailers
        </Typography>
        <div className="mda:grid mda:gap-4 mda:grid-cols-1 mda:md:grid-cols-2 mda:lg:grid-cols-3">
          {trailers.map((trailer) => (
            <TrailerCard
              key={trailer.id}
              videoKey={trailer.key ?? ''}
              title={trailer.name ?? 'Trailer'}
              type={trailer.type ?? 'Trailer'}
            />
          ))}
        </div>
      </Section>
    </Container>
  )
}

export default TrailersSection
