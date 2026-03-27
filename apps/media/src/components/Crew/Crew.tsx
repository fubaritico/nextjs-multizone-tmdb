'use client'

import { Container, Section } from '@vite-mf-monorepo/layouts'
import { getImageUrl } from '@vite-mf-monorepo/shared'
import { Skeleton, Talent, Typography } from '@vite-mf-monorepo/ui'

import { useMediaCredits } from '@/hooks'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Props for {@link Crew}. */
interface CrewProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Renders the key crew members (Director + Writing credits) for a movie or TV series.
 *
 * Shows vertical Talent cards with avatar, name, and role.
 * Returns `null` when no director or writers are found.
 */
const Crew: FC<CrewProps> = ({ id, mediaType }) => {
  const { data: credits, isLoading, error } = useMediaCredits(mediaType, id)

  if (isLoading) {
    return (
      <Container variant="muted">
        <Section maxWidth="xl" spacing="lg">
          <div data-testid="crew">
            <Typography variant="h2" className="mda:mb-6">
              Crew
            </Typography>
            <div className="mda:flex mda:gap-6">
              <Skeleton variant="circle" width="80px" height="80px" />
              <Skeleton variant="circle" width="80px" height="80px" />
              <Skeleton variant="circle" width="80px" height="80px" />
            </div>
          </div>
        </Section>
      </Container>
    )
  }

  if (error || !credits?.crew) {
    return null
  }

  const director = credits.crew.find((c) => c.job === 'Director')
  const writers = credits.crew
    .filter((c) => c.department === 'Writing')
    .slice(0, 2)

  if (!director && writers.length === 0) {
    return null
  }

  return (
    <Container variant="muted">
      <Section maxWidth="xl" spacing="lg">
        <div data-testid="crew">
          <Typography variant="h2" className="mda:mb-6">
            Crew
          </Typography>
          <div className="mda:flex mda:flex-row mda:flex-wrap mda:gap-6 mda:justify-start">
            {director && (
              <Talent
                name={director.name ?? 'Unknown'}
                role="Director"
                imageSrc={
                  director.profile_path
                    ? getImageUrl(director.profile_path, 'w185')
                    : undefined
                }
                variant="vertical"
                size="3xl"
              />
            )}
            {writers.map((writer) => (
              <Talent
                key={writer.id}
                name={writer.name ?? 'Unknown'}
                role={writer.job ?? 'Writer'}
                imageSrc={
                  writer.profile_path
                    ? getImageUrl(writer.profile_path, 'w185')
                    : undefined
                }
                variant="vertical"
                size="3xl"
              />
            ))}
          </div>
        </div>
      </Section>
    </Container>
  )
}

export default Crew
