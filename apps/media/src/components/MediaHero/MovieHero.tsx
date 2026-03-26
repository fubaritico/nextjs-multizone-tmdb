'use client'

import { movieDetailsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Badge, Rating, Skeleton, Typography } from '@vite-mf-monorepo/ui'
import { HeroImage } from '@vite-mf-monorepo/ui/next'

import type { MovieDetailsResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Props for the MovieHero component. */
interface MovieHeroProps {
  /** TMDB movie ID. */
  id: number
}

/**
 * Formats a runtime in minutes into a human-readable string (e.g. "2h 22m").
 * Returns null when runtime is falsy.
 */
function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${String(m)}m`
  if (m === 0) return `${String(h)}h`
  return `${String(h)}h ${String(m)}m`
}

/**
 * MovieHero renders the full-width hero banner for a movie detail page.
 *
 * Fetches movie details via useQuery (cache seeded by prefetchQuery in page.tsx).
 * Displays the backdrop image, title, release year, runtime, rating, and genre badges.
 *
 * Loading: full-width Skeleton placeholder.
 * Error: error message displayed over a dark backdrop area.
 */
const MovieHero: FC<MovieHeroProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    movieDetailsOptions({ path: { movie_id: id } })
  ) as UseQueryResult<MovieDetailsResponse>

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangle"
        className="mda:w-full mda:hero-height"
        aspectRatio="21/9"
        rounded={false}
      />
    )
  }

  if (error || !data) {
    const errorMsg =
      error instanceof Error ? error.message : 'Failed to load movie details'
    return (
      <div className="mda:flex mda:items-center mda:justify-center mda:w-full mda:hero-height mda:bg-black/80">
        <Typography variant="body" className="mda:text-white!">
          {errorMsg}
        </Typography>
      </div>
    )
  }

  const year = data.release_date
    ? new Date(data.release_date).getFullYear()
    : null
  const runtime = formatRuntime(data.runtime)
  const genreNames = data.genres?.map((g) => g.name) ?? []
  const subtitleParts = [year ? String(year) : null, runtime].filter(
    (v): v is string => v !== null
  )

  return (
    <div className="mda:relative mda:w-full">
      <div className="mda:relative mda:hero-height mda:w-full mda:overflow-hidden">
        <HeroImage backdropPath={data.backdrop_path} title={data.title} />

        {/* Content overlay — no gradient here, HeroImage renders its own */}
        <div className="mda:absolute mda:inset-0 mda:z-2 mda:flex mda:items-end">
          <div className="mda:w-full mda:max-w-screen-xl mda:mx-auto mda:px-4 mda:sm:px-5 mda:lg:px-6 mda:pb-4 mda:sm:pb-5 mda:md:pb-6 mda:lg:pb-8">
            <div className="mda:flex mda:flex-col mda:w-full">
              {/* Title */}
              <Typography
                variant="h1"
                className="mda:mb-1 mda:sm:mb-2 mda:text-white! mda:text-shadow-medium"
              >
                {data.title ?? 'Unknown'}
              </Typography>

              {/* Tagline */}
              {data.tagline && (
                <Typography
                  variant="lead"
                  className="mda:mb-2 mda:sm:mb-3 mda:md:mb-4 mda:italic mda:text-white! mda:opacity-90 mda:text-shadow-strong"
                >
                  {data.tagline}
                </Typography>
              )}

              {/* Meta row: year · runtime · rating */}
              <div className="mda:mb-2 mda:sm:mb-3 mda:md:mb-4 mda:flex mda:items-center mda:gap-2 mda:text-white!">
                {subtitleParts.length > 0 && (
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    {subtitleParts.join(' · ')}
                  </Typography>
                )}
                {data.vote_average !== undefined && data.vote_average > 0 && (
                  <>
                    <Typography
                      as="span"
                      variant="body"
                      className="mda:text-white! mda:text-shadow-strong"
                    >
                      •
                    </Typography>
                    <Rating
                      value={data.vote_average}
                      size="sm"
                      variant="circle"
                    />
                  </>
                )}
              </div>

              {/* Genre badges */}
              {genreNames.length > 0 && (
                <div className="mda:flex mda:flex-wrap mda:gap-2">
                  {genreNames.map((genre) => (
                    <Badge key={genre} variant="secondary" size="sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieHero
