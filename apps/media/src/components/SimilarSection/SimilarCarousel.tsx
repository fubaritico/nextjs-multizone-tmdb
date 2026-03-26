'use client'

import {
  movieSimilarOptions,
  tvSeriesSimilarOptions,
} from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Typography,
} from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Shared shape for result items in both movie and TV similar responses. */
interface SimilarItem {
  id?: number
  title?: string
  name?: string
  poster_path?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
}

/** Maximum number of similar items to display. */
const MAX_SIMILAR_DISPLAY = 20

/** Props for {@link SimilarCarousel}. */
interface SimilarCarouselProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Displays a carousel of similar movies or TV series.
 *
 * Branches the `useQuery` call based on `mediaType` — same factory as server prefetch.
 * Returns `null` on error or when the results list is empty.
 */
const SimilarCarousel: FC<SimilarCarouselProps> = ({ id, mediaType }) => {
  const movieQuery = useQuery({
    ...movieSimilarOptions({ path: { movie_id: id } }),
    enabled: mediaType === 'movie',
  })

  const tvQuery = useQuery({
    ...tvSeriesSimilarOptions({ path: { series_id: String(id) } }),
    enabled: mediaType === 'tv',
  })

  const { data, isLoading, error } =
    mediaType === 'movie' ? movieQuery : tvQuery

  if (isLoading) {
    return <CarouselLoading count={6} />
  }

  if (error ?? !data) return null

  const results = ((data as { results?: SimilarItem[] }).results ?? []).slice(
    0,
    MAX_SIMILAR_DISPLAY
  )

  if (results.length === 0) return null

  return (
    <section data-testid="similar-section">
      <Typography variant="h2" className="mda:mb-4">
        Similar
      </Typography>
      <Carousel rounded={false}>
        {results.map((item) => (
          <CarouselItem key={item.id}>
            <div style={{ width: 150 }}>
              <MovieCard
                as="link"
                href={`/${mediaType}/${String(item.id)}`}
                id={item.id ?? 0}
                title={item.title ?? item.name ?? 'Unknown'}
                posterUrl={item.poster_path ?? ''}
                voteAverage={item.vote_average ?? 0}
                year={
                  item.release_date
                    ? new Date(item.release_date).getFullYear()
                    : item.first_air_date
                      ? new Date(item.first_air_date).getFullYear()
                      : null
                }
              />
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </section>
  )
}

export default SimilarCarousel
