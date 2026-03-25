'use client'

import { movieNowPlayingListOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  HeroImage,
  Skeleton,
  Typography,
} from '@vite-mf-monorepo/ui'
import Link from 'next/link'

import type { MovieNowPlayingListResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/**
 * HeroSection displays an auto-rotating carousel of now-playing movies as a
 * full-width hero banner.
 *
 * Uses `Carousel variant="hero"` with `CarouselItem isHero` so each slide
 * occupies the full viewport width and auto-rotates.
 *
 * Data comes from the TanStack Query cache seeded by `prefetchQuery` in the
 * parent Server Component (page.tsx) — on first render the cache is always a
 * HIT so no loading state is shown to the user.
 */
const HeroSection: FC = () => {
  const { data, isLoading, error } = useQuery(
    movieNowPlayingListOptions()
  ) as UseQueryResult<MovieNowPlayingListResponse>

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangle"
        className="hm:w-full hm:hero-height"
        aspectRatio="21/9"
        rounded={false}
      />
    )
  }

  if (error || !data) {
    const errorMsg = error?.message ?? (!data ? 'No data' : 'Failed to load')
    return <Carousel variant="hero" rounded={false} errorMessage={errorMsg} />
  }

  return (
    <Carousel
      variant="hero"
      rounded={false}
      gap={0}
      heroControlsClassName="hm:max-w-screen-xl hm:px-5 hm:sm:px-5 hm:md:px-5 hm:lg:px-6"
    >
      {data.results?.slice(0, 6).map((item) => (
        <CarouselItem key={item.id} isHero>
          <Link
            href={`/movie/${String(item.id)}`}
            className="hm:block hm:no-underline"
          >
            <div className="hm:relative hm:hero-height hm:w-full hm:overflow-hidden">
              <HeroImage backdropPath={item.backdrop_path} title={item.title} />

              {/* Content Overlay */}
              <div className="hm:absolute hm:left-1/2 hm:-translate-x-1/2 hm:z-2 hm:w-full hm:max-w-screen-xl hm:px-4 hm:sm:px-5 hm:md:px-5 hm:lg:px-5 hm:bottom-8 hm:sm:bottom-8 hm:md:bottom-8 hm:lg:bottom-10 hm:flex hm:justify-start hm:items-end">
                <div className="hm:flex hm:flex-col hm:w-full hm:max-w-lg">
                  <Typography
                    variant="h2"
                    className="hm:mb-2 hm:text-white! hm:text-shadow-medium"
                  >
                    {item.title ?? 'Unknown'}
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="hm:text-white! hm:text-shadow-strong"
                  >
                    {item.overview ?? ''}
                  </Typography>
                </div>
              </div>
            </div>
          </Link>
        </CarouselItem>
      ))}
    </Carousel>
  )
}

export default HeroSection
