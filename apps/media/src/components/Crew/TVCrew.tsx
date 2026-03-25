'use client'

import { tvSeriesCreditsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton, Typography } from '@vite-mf-monorepo/ui'

import type { TvSeriesCreditsResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Props for {@link TVCrew}. */
interface TVCrewProps {
  /** TMDB TV series ID. */
  id: number
}

/**
 * Crew member shape from the TMDB TV credits response.
 * Extracted from the `crew` array of {@link TvSeriesCreditsResponse}.
 */
type CrewMember = NonNullable<
  NonNullable<TvSeriesCreditsResponse>['crew']
>[number]

/**
 * Jobs included in the Director category (Directing department).
 * @internal
 */
const DIRECTOR_JOBS = new Set(['Director'])

/**
 * Writing department jobs to surface in the Crew section.
 * @internal
 */
const WRITING_DEPARTMENT = 'Writing'

/**
 * Returns `true` if a crew member should be displayed in the Crew section.
 *
 * Includes: Director (Directing department) and all Writing department credits
 * (Screenplay, Story, Novel, Writer, Characters, etc.).
 *
 * @param member - Crew member from TMDB TV credits response.
 */
function isRelevantCrewMember(member: CrewMember): boolean {
  return (
    (member.department === 'Directing' &&
      DIRECTOR_JOBS.has(member.job ?? '')) ||
    member.department === WRITING_DEPARTMENT
  )
}

/**
 * Renders the key crew members (Director + Writing credits) for a TV series.
 *
 * Uses `useQuery` with `tvSeriesCreditsOptions` — the same factory used by the
 * server-side `prefetchQuery` in `page.tsx`, guaranteeing a cache hit on
 * first render (no loading flash).
 *
 * Returns `null` when there are no relevant crew members or an error occurred
 * (graceful degradation — per legacy behavior).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB TV series ID.
 */
const TVCrew: FC<TVCrewProps> = ({ id }) => {
  const { data, isLoading } = useQuery(
    tvSeriesCreditsOptions({ path: { series_id: id } })
  ) as UseQueryResult<TvSeriesCreditsResponse>

  if (isLoading) {
    return (
      <div data-testid="crew" className="mda:flex mda:flex-col mda:gap-4">
        <Typography variant="h2">Crew</Typography>
        <div className="mda:flex mda:flex-wrap mda:gap-6">
          <Skeleton variant="rectangle" width="120px" height="48px" />
          <Skeleton variant="rectangle" width="120px" height="48px" />
          <Skeleton variant="rectangle" width="120px" height="48px" />
        </div>
      </div>
    )
  }

  const relevantCrew = data?.crew?.filter(isRelevantCrewMember) ?? []

  if (relevantCrew.length === 0) return null

  return (
    <div data-testid="crew" className="mda:flex mda:flex-col mda:gap-4">
      <Typography variant="h2">Crew</Typography>
      <ul className="mda:flex mda:flex-wrap mda:gap-6 mda:list-none mda:p-0 mda:m-0">
        {relevantCrew.map((member) => (
          <li
            key={member.credit_id}
            className="mda:flex mda:flex-col mda:gap-1"
          >
            <Typography variant="body-sm" className="mda:font-bold">
              {member.name}
            </Typography>
            <Typography variant="body-sm">{member.job}</Typography>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TVCrew
