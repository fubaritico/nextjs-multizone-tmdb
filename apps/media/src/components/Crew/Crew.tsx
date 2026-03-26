'use client'

import {
  movieCreditsOptions,
  tvSeriesCreditsOptions,
} from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton, Typography } from '@vite-mf-monorepo/ui'

import type { MediaType } from '@/types/media'
import type {
  MovieCreditsResponse,
  TvSeriesCreditsResponse,
} from '@fubar-it-co/tmdb-client'
import type { FC } from 'react'

/** Props for {@link Crew}. */
interface CrewProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/** Crew member shape — same structure in both movie and TV credits. */
type CrewMember = NonNullable<
  NonNullable<MovieCreditsResponse | TvSeriesCreditsResponse>['crew']
>[number]

/** @internal */
const DIRECTOR_JOBS = new Set(['Director'])

/** @internal */
const WRITING_DEPARTMENT = 'Writing'

/** Returns `true` if a crew member is a Director or Writer. */
function isRelevantCrewMember(member: CrewMember): boolean {
  return (
    (member.department === 'Directing' &&
      DIRECTOR_JOBS.has(member.job ?? '')) ||
    member.department === WRITING_DEPARTMENT
  )
}

/**
 * Renders the key crew members (Director + Writing credits) for a movie or TV series.
 *
 * Branches the `useQuery` call based on `mediaType` — same factory as server prefetch.
 * Returns `null` when no relevant crew members are found.
 */
const Crew: FC<CrewProps> = ({ id, mediaType }) => {
  const movieQuery = useQuery({
    ...movieCreditsOptions({ path: { movie_id: id } }),
    enabled: mediaType === 'movie',
  })

  const tvQuery = useQuery({
    ...tvSeriesCreditsOptions({ path: { series_id: id } }),
    enabled: mediaType === 'tv',
  })

  const { data, isLoading } = mediaType === 'movie' ? movieQuery : tvQuery

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

export default Crew
