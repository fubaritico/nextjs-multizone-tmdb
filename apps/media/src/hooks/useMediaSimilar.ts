import { useMovieSimilar } from './useMovieSimilar'
import { useTVSimilar } from './useTVSimilar'

import type { MediaType } from '@/types/media'
import type {
  MovieSimilarResponse,
  TMDBError,
  TvSeriesSimilarResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export type MediaSimilarQueryResult =
  | UseQueryResult<MovieSimilarResponse, TMDBError>
  | UseQueryResult<TvSeriesSimilarResponse, TMDBError>

export function useMediaSimilar(
  mediaType: MediaType,
  contentId: number
): MediaSimilarQueryResult {
  const query = mediaType === 'tv' ? useTVSimilar : useMovieSimilar
  return query(contentId)
}
