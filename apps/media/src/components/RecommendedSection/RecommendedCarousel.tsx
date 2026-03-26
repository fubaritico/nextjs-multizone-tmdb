'use client'

import {
  movieRecommendationsOptions,
  tvSeriesRecommendationsOptions,
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

/** Shared shape for result items in both movie and TV recommendations. */
interface RecommendedItem {
  id?: number
  title?: string
  name?: string
  poster_path?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
}

/** Maximum number of recommended items to display. */
const MAX_RESULTS = 20

/** Props for {@link RecommendedCarousel}. */
interface RecommendedCarouselProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Carousel that displays recommended movies or TV series.
 *
 * Branches the `useQuery` call based on `mediaType` — same factory as server prefetch.
 * Returns `null` on error or when the recommendations list is empty.
 */
const RecommendedCarousel: FC<RecommendedCarouselProps> = ({
  id,
  mediaType,
}) => {
  const movieQuery = useQuery({
    ...movieRecommendationsOptions({ path: { movie_id: id } }),
    enabled: mediaType === 'movie',
  })

  const tvQuery = useQuery({
    ...tvSeriesRecommendationsOptions({ path: { series_id: id } }),
    enabled: mediaType === 'tv',
  })

  const { data, isLoading, error } =
    mediaType === 'movie' ? movieQuery : tvQuery

  if (isLoading) {
    return <CarouselLoading count={6} />
  }

  if (error ?? !data) return null

  const results = (
    (data as { results?: RecommendedItem[] }).results ?? []
  ).slice(0, MAX_RESULTS)

  if (results.length === 0) return null

  return (
    <section data-testid="recommended-section">
      <Typography variant="h2" className="mda:mb-4">
        Recommended
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

export default RecommendedCarousel
