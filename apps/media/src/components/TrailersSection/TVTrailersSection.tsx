'use client'

import { tvSeriesVideosOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton, Typography } from '@vite-mf-monorepo/ui'

import type { TvSeriesVideosResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Maximum number of trailers to display. */
const MAX_TRAILERS = 3

/** Props for {@link TVTrailersSection}. */
interface TVTrailersSectionProps {
  /** TMDB TV series ID. */
  id: number
}

/**
 * Displays up to 3 official YouTube trailers for a given TV series.
 *
 * Fetches videos via `useQuery(tvSeriesVideosOptions(...))` — the same factory
 * used by the server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache
 * hit on first render (no loading flash).
 *
 * Filters client-side for `type === 'Trailer' && site === 'YouTube' && official === true`
 * then limits to {@link MAX_TRAILERS}.
 *
 * Returns `null` on error or when no qualifying trailers are found (graceful
 * degradation matching legacy behavior).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB TV series ID used to fetch videos.
 */
const TVTrailersSection: FC<TVTrailersSectionProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    tvSeriesVideosOptions({ path: { series_id: id } })
  ) as UseQueryResult<TvSeriesVideosResponse>

  if (isLoading) {
    return (
      <section data-testid="trailers-section">
        <Typography variant="h2" className="mda:mb-4">
          Trailers
        </Typography>
        <div className="mda:grid mda:grid-cols-1 mda:gap-4 md:mda:grid-cols-2 lg:mda:grid-cols-3">
          {Array.from({ length: MAX_TRAILERS }).map((_, index) => (
            <Skeleton
              key={index}
              className="mda:aspect-video mda:w-full mda:rounded-lg"
            />
          ))}
        </div>
      </section>
    )
  }

  if (error ?? !data) return null

  const trailers = (data.results ?? [])
    .filter(
      (video) =>
        video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true &&
        video.key != null
    )
    .slice(0, MAX_TRAILERS)

  if (trailers.length === 0) return null

  return (
    <section data-testid="trailers-section">
      <Typography variant="h2" className="mda:mb-4">
        Trailers
      </Typography>
      <div className="mda:grid mda:grid-cols-1 mda:gap-4 md:mda:grid-cols-2 lg:mda:grid-cols-3">
        {trailers.map((trailer) => (
          <div key={trailer.id} className="mda:aspect-video mda:w-full">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key ?? ''}`}
              title={trailer.name ?? 'Trailer'}
              className="mda:h-full mda:w-full mda:rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default TVTrailersSection
