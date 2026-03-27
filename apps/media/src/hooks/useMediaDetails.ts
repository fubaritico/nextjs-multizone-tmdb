import { useMovieDetails } from './useMovieDetails'
import { useTVDetails } from './useTVDetails'

import type { MediaType } from '@/types/media'
import type {
  MovieDetailsResponse,
  TMDBError,
  TvSeriesDetailsResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export type MediaDetailsQueryResult =
  | UseQueryResult<MovieDetailsResponse, TMDBError>
  | UseQueryResult<TvSeriesDetailsResponse, TMDBError>

export function useMediaDetails(
  mediaType: MediaType,
  contentId: number
): MediaDetailsQueryResult {
  const query = mediaType === 'tv' ? useTVDetails : useMovieDetails

  return query(contentId)
}
