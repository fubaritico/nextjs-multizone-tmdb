'use client'

import { Container, Section } from '@vite-mf-monorepo/layouts'
import { Typography } from '@vite-mf-monorepo/ui'

import SimilarMoviesCarousel from './SimilarMoviesCarousel'
import SimilarTVCarousel from './SimilarTVCarousel'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Props for {@link SimilarSection}. */
interface SimilarSectionProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Renders a "You may also like" section with a carousel of similar content.
 *
 * Conditionally renders SimilarMoviesCarousel or SimilarTVCarousel
 * based on the mediaType prop.
 */
const SimilarSection: FC<SimilarSectionProps> = ({ id, mediaType }) => {
  return (
    <Container variant="default">
      <Section maxWidth="xl" spacing="md">
        <div className="mda:flex mda:flex-col mda:gap-4">
          <Typography variant="h2">You may also like</Typography>

          {mediaType === 'movie' ? (
            <SimilarMoviesCarousel id={id} />
          ) : (
            <SimilarTVCarousel id={id} />
          )}
        </div>
      </Section>
    </Container>
  )
}

export default SimilarSection
