'use client'

import { getImageUrl } from '@vite-mf-monorepo/shared'
import {
  Carousel,
  CarouselItem,
  CarouselLoading,
  Typography,
} from '@vite-mf-monorepo/ui'
import { MovieCard } from '@vite-mf-monorepo/ui/next'

import { useTVRecommendations } from '@/hooks'

import type { FC } from 'react'

interface RecommendedTVCarouselProps {
  id: number
}

const RecommendedTVCarousel: FC<RecommendedTVCarouselProps> = ({ id }) => {
  const { data, isLoading, error } = useTVRecommendations(id)

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
          No TV series recommendations
        </Typography>
      </Carousel>
    )
  }

  return (
    <Carousel rounded={false}>
      {data.results.slice(0, 20).map((item) => {
        const posterUrl = item.poster_path
          ? getImageUrl(item.poster_path, 'w92')
          : ''
        const year = item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : null

        return (
          <CarouselItem key={item.id}>
            <div style={{ width: 150 }}>
              <MovieCard
                as="zone-link"
                href={`/tv/${String(item.id)}`}
                id={item.id ?? 0}
                title={item.name ?? 'Unknown'}
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

export default RecommendedTVCarousel
