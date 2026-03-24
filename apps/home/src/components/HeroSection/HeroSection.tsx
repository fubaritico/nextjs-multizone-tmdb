'use client'

import { movieNowPlayingListOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import {
  Carousel,
  CarouselItem,
  HeroImage,
  Rating,
  Skeleton,
  Typography,
} from '@vite-mf-monorepo/ui'
import Link from 'next/link'

import type { MovieNowPlayingListResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Number of now-playing movies to display in the hero carousel. */
const HERO_SLIDE_COUNT = 6

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
  const { data, isLoading } = useQuery(
    movieNowPlayingListOptions()
  ) as UseQueryResult<MovieNowPlayingListResponse>

  if (isLoading) {
    return (
      <div className="hm:relative hm:w-full hm:overflow-hidden hm:aspect-[21/9] hm:lg:aspect-auto hm:lg:max-h-[440px] hm:lg:h-[440px]">
        <Skeleton
          variant="rectangle"
          width="hm:w-full"
          height="hm:h-full"
          rounded={false}
        />
      </div>
    )
  }

  const movies = data?.results?.slice(0, HERO_SLIDE_COUNT) ?? []

  if (movies.length === 0) {
    return null
  }

  return (
    <section
      className="hm:relative hm:w-full hm:overflow-hidden hm:aspect-[21/9] hm:lg:aspect-auto hm:lg:max-h-[440px] hm:lg:h-[440px]"
      aria-label="Now Playing"
    >
      <Carousel
        variant="hero"
        gap={0}
        rounded={false}
        heroControlsClassName="hm:z-10"
      >
        {movies.map((movie) => {
          const releaseYear = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null

          return (
            <CarouselItem key={movie.id} isHero>
              <div className="hm:relative hm:w-full hm:h-full">
                <HeroImage
                  backdropPath={movie.backdrop_path}
                  title={movie.title}
                />

                {/* Content overlay */}
                <div className="hm:absolute hm:inset-0 hm:z-10 hm:flex hm:items-end hm:pb-8 hm:px-6 hm:max-w-screen-xl hm:mx-auto hm:left-0 hm:right-0">
                  <div className="hm:flex hm:flex-col hm:gap-3 hm:max-w-2xl">
                    {releaseYear && (
                      <Typography
                        variant="caption"
                        className="hm:text-white/70 hm:text-shadow-medium"
                      >
                        {releaseYear}
                      </Typography>
                    )}

                    <Typography
                      variant="h1"
                      className="hm:text-white hm:text-shadow-strong"
                    >
                      {movie.title ?? 'Unknown Title'}
                    </Typography>

                    {movie.vote_average != null && movie.vote_average > 0 && (
                      <Rating
                        value={movie.vote_average}
                        max={10}
                        variant="circle"
                        size="md"
                        showValue
                      />
                    )}

                    {movie.overview && (
                      <Typography
                        variant="body"
                        className="hm:text-white/90 hm:line-clamp-3 hm:text-shadow-medium"
                      >
                        {movie.overview}
                      </Typography>
                    )}

                    {movie.id != null && (
                      <Link
                        href={`/movie/${String(movie.id)}`}
                        className="hm:mt-2 hm:inline-flex hm:items-center hm:gap-2 hm:rounded-full hm:bg-white hm:px-5 hm:py-2 hm:text-sm hm:font-semibold hm:text-black hm:transition-opacity hover:hm:opacity-80 hm:w-fit"
                      >
                        More info
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          )
        })}
      </Carousel>
    </section>
  )
}

export default HeroSection
