'use client'

import { tvSeriesDetailsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Badge, Rating, Skeleton, Typography } from '@vite-mf-monorepo/ui'
import { HeroImage } from '@vite-mf-monorepo/ui/next'

import type { TvSeriesDetailsResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Props for the TVHero component. */
interface TVHeroProps {
  /** TMDB TV series ID. */
  id: number
}

/**
 * Formats a runtime array (episode_run_time) into a human-readable string.
 * Uses the first element of the array.
 * Returns null when array is empty or falsy.
 */
function formatEpisodeRuntime(
  runtimes: number[] | null | undefined
): string | null {
  if (!runtimes || runtimes.length === 0) return null
  const minutes = runtimes[0]
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${String(m)}m`
  if (m === 0) return `${String(h)}h`
  return `${String(h)}h ${String(m)}m`
}

/**
 * TVHero renders the full-width hero banner for a TV series detail page.
 *
 * Fetches TV series details via useQuery (cache seeded by prefetchQuery in page.tsx).
 * Displays the backdrop image, series name, first air year, episode runtime,
 * rating, and genre badges.
 *
 * Loading: full-width Skeleton placeholder.
 * Error: error message displayed over a dark backdrop area.
 */
const TVHero: FC<TVHeroProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    tvSeriesDetailsOptions({ path: { series_id: id } })
  ) as UseQueryResult<TvSeriesDetailsResponse>

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangle"
        className="mda:w-full"
        aspectRatio="21/9"
        rounded={false}
      />
    )
  }

  if (error || !data) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : 'Failed to load TV series details'
    return (
      <div className="mda:flex mda:items-center mda:justify-center mda:w-full mda:aspect-[21/9] mda:bg-black/80">
        <Typography variant="body" className="mda:text-white!">
          {errorMsg}
        </Typography>
      </div>
    )
  }

  const year = data.first_air_date
    ? new Date(data.first_air_date).getFullYear()
    : null
  const episodeRuntime = formatEpisodeRuntime(data.episode_run_time)
  const genreNames = data.genres?.map((g) => g.name) ?? []
  const subtitleParts = [year ? String(year) : null, episodeRuntime].filter(
    (v): v is string => v !== null
  )

  return (
    <div className="mda:relative mda:w-full mda:aspect-[21/9] mda:overflow-hidden">
      <HeroImage backdropPath={data.backdrop_path} title={data.name} />

      {/* Content overlay */}
      <div className="mda:absolute mda:inset-0 mda:bg-gradient-to-t mda:from-black/80 mda:via-black/20 mda:to-transparent mda:flex mda:items-end">
        <div className="mda:w-full mda:max-w-screen-xl mda:mx-auto mda:px-4 mda:sm:px-5 mda:lg:px-6 mda:pb-8 mda:sm:pb-10">
          <div className="mda:flex mda:flex-col mda:gap-3 mda:max-w-2xl">
            {/* Title */}
            <Typography
              variant="h1"
              className="mda:text-white! mda:text-shadow-medium"
            >
              {data.name ?? 'Unknown'}
            </Typography>

            {/* Meta row: year · episode runtime · rating */}
            <div className="mda:flex mda:items-center mda:gap-3 mda:flex-wrap">
              {subtitleParts.length > 0 && (
                <Typography
                  variant="body-sm"
                  className="mda:text-white! mda:text-shadow-strong"
                >
                  {subtitleParts.join(' · ')}
                </Typography>
              )}
              {data.vote_average !== undefined && data.vote_average > 0 && (
                <Rating value={data.vote_average} size="sm" variant="circle" />
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
  )
}

export default TVHero
