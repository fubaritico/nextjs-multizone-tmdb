'use client'

import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Typography,
} from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import { useMovieRecommendations } from '@/hooks'

import type { FC } from 'react'

interface RecommendedMoviesCarouselProps {
  id: number
}

const RecommendedMoviesCarousel: FC<RecommendedMoviesCarouselProps> = ({
  id,
}) => {
  const { data, isLoading, error } = useMovieRecommendations(id)

  if (isLoading) {
    return <CarouselLoading count={6} />
  }

  if (error || !data) {
    const errorMsg =
      error?.status_message ?? (!data ? 'No data' : 'Failed to load')
    return <Carousel errorMessage={errorMsg} />
  }

  if (!data.results?.length) {
    return (
      <Carousel>
        <Typography variant="body" className="mda:text-muted-foreground">
          No movie recommendations
        </Typography>
      </Carousel>
    )
  }

  return (
    <Carousel rounded={false}>
      {data.results.slice(0, 20).map((item) => {
        const posterUrl = item.poster_path ?? ''
        const year = item.release_date
          ? new Date(item.release_date).getFullYear()
          : null

        return (
          <CarouselItem key={item.id}>
            <div style={{ width: 150 }}>
              <MovieCard
                as="zone-link"
                href={`/movie/${String(item.id)}`}
                id={item.id ?? 0}
                title={item.title ?? 'Unknown'}
                posterUrl={posterUrl}
                voteAverage={item.vote_average ?? 0}
                year={year}
              />
            </div>
          </CarouselItem>
        )
      })}
    </Carousel>
  )
}

export default RecommendedMoviesCarousel
