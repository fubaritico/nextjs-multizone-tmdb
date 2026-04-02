'use client'

import { Container, Section } from '@vite-mf-monorepo/layouts'
import { Skeleton, Typography } from '@vite-mf-monorepo/ui'

import { useMediaDetails } from '@/hooks'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Props for {@link Synopsis}. */
interface SynopsisProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Renders the overview text for a movie or TV series.
 *
 * Returns `null` when overview is empty (graceful degradation).
 */
const Synopsis: FC<SynopsisProps> = ({ id, mediaType }) => {
  const { data, isLoading } = useMediaDetails(mediaType, id)

  if (isLoading) {
    return (
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl" data-testid="synopsis">
          <Typography variant="h2">Synopsis</Typography>
          <div className="mda:flex mda:flex-col mda:gap-2">
            <Skeleton variant="line" width="100%" />
            <Skeleton variant="line" width="100%" />
            <Skeleton variant="line" width="75%" />
          </div>
        </Section>
      </Container>
    )
  }

  if (!data?.overview) return null

  return (
    <Container variant="default">
      <Section spacing="lg" maxWidth="xl" data-testid="synopsis">
        <Typography variant="h2">Synopsis</Typography>
        <Typography variant="body">{data.overview}</Typography>
      </Section>
    </Container>
  )
}

export default Synopsis
