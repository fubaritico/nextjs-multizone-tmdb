import { useMovieCredits } from './useMovieCredits'
import { useTVCredits } from './useTVCredits'

import type { MediaType } from '@/types/media'
import type {
  MovieCreditsResponse,
  TMDBError,
  TvSeriesCreditsResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export type MediaCreditsQueryResult =
  | UseQueryResult<MovieCreditsResponse, TMDBError>
  | UseQueryResult<TvSeriesCreditsResponse, TMDBError>

export function useMediaCredits(
  mediaType: MediaType,
  contentId: number
): MediaCreditsQueryResult {
  const query = mediaType === 'tv' ? useTVCredits : useMovieCredits

  return query(contentId)
}
