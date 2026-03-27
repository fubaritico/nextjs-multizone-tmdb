'use client'

import { Container, Section } from '@vite-mf-monorepo/layouts'
import { Typography } from '@vite-mf-monorepo/ui'

import RecommendedMoviesCarousel from './RecommendedMoviesCarousel'
import RecommendedTVCarousel from './RecommendedTVCarousel'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

interface RecommendedSectionProps {
  id: number
  mediaType: MediaType
}

const RecommendedSection: FC<RecommendedSectionProps> = ({ id, mediaType }) => {
  return (
    <Container variant="default">
      <Section maxWidth="xl" spacing="md">
        <div className="mda:flex mda:flex-col mda:gap-4">
          <Typography variant="h2">Recommended for you</Typography>

          {mediaType === 'movie' ? (
            <RecommendedMoviesCarousel id={id} />
          ) : (
            <RecommendedTVCarousel id={id} />
          )}
        </div>
      </Section>
    </Container>
  )
}

export default RecommendedSection
