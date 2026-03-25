'use client'

import { tvSeriesDetailsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton, Typography } from '@vite-mf-monorepo/ui'

import type { TvSeriesDetailsResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Props for {@link TVSynopsis}. */
interface TVSynopsisProps {
  /** TMDB TV series ID. */
  id: number
}

/**
 * Renders the overview text for a TV series.
 *
 * Uses `useQuery` with `tvSeriesDetailsOptions` — the same factory used by the
 * server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit on
 * first render (no loading flash).
 *
 * Returns `null` when overview is empty or an error occurred (graceful
 * degradation — synopsis is not a critical section).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB TV series ID.
 */
const TVSynopsis: FC<TVSynopsisProps> = ({ id }) => {
  const { data, isLoading } = useQuery(
    tvSeriesDetailsOptions({ path: { series_id: id } })
  ) as UseQueryResult<TvSeriesDetailsResponse>

  if (isLoading) {
    return (
      <div data-testid="synopsis" className="mda:flex mda:flex-col mda:gap-4">
        <Typography variant="h2">Synopsis</Typography>
        <div className="mda:flex mda:flex-col mda:gap-2">
          <Skeleton variant="line" width="100%" />
          <Skeleton variant="line" width="100%" />
          <Skeleton variant="line" width="75%" />
        </div>
      </div>
    )
  }

  if (!data?.overview) return null

  return (
    <div data-testid="synopsis" className="mda:flex mda:flex-col mda:gap-4">
      <Typography variant="h2">Synopsis</Typography>
      <Typography variant="body">{data.overview}</Typography>
    </div>
  )
}

export default TVSynopsis
