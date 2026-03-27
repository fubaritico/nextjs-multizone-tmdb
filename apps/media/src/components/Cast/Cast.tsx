'use client'

import { Container, Section } from '@vite-mf-monorepo/layouts'
import { getImageUrl } from '@vite-mf-monorepo/shared'
import { Skeleton, Talent, Typography } from '@vite-mf-monorepo/ui'
import { Button } from '@vite-mf-monorepo/ui/next'

import { useMediaCredits } from '@/hooks'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Props for {@link Cast}. */
interface CastProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Displays a 2-column grid of top 10 cast members for a movie or TV series.
 *
 * Each entry shows a horizontal Talent card with avatar, name, and character.
 * A "Whole cast" button links to the full cast page.
 *
 * Returns `null` on error or when the cast list is empty.
 */
const Cast: FC<CastProps> = ({ id, mediaType }) => {
  const { data: credits, isLoading, error } = useMediaCredits(mediaType, id)

  if (isLoading) {
    return (
      <Container variant="default">
        <Section maxWidth="xl" spacing="lg">
          <section data-testid="cast-section">
            <Typography variant="h2" className="mda:mb-6">
              Cast
            </Typography>
            <div className="mda:grid mda:grid-cols-2 mda:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangle"
                  width="100%"
                  height="64px"
                />
              ))}
            </div>
          </section>
        </Section>
      </Container>
    )
  }

  if (error || !credits?.cast?.length) return null

  const topCast = credits.cast.slice(0, 10)

  return (
    <Container variant="default">
      <Section maxWidth="xl" spacing="lg">
        <section data-testid="cast-section">
          <Typography variant="h2" className="mda:mb-6">
            Cast
          </Typography>
          <div className="mda:grid mda:grid-cols-2 mda:gap-6 mda:mb-8">
            {topCast.map((actor) => (
              <Talent
                key={actor.credit_id}
                name={actor.name ?? 'Unknown'}
                role={actor.character ?? ''}
                imageSrc={
                  actor.profile_path
                    ? getImageUrl(actor.profile_path, 'w185')
                    : undefined
                }
                variant="horizontal"
                size="xl"
              />
            ))}
          </div>
          <Button
            as="zone-link"
            href="#"
            variant="outline"
            size="sm"
            icon="Users"
            iconPosition="left"
          >
            Whole cast
          </Button>
        </section>
      </Section>
    </Container>
  )
}

export default Cast
