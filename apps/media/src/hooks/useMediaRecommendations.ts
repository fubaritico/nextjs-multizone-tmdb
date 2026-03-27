import { useMovieRecommendations } from './useMovieRecommendations'
import { useTVRecommendations } from './useTVRecommendations'

import type { MediaType } from '@/types/media'
import type {
  MovieSimilarResponse,
  TMDBError,
  TvSeriesRecommendationsResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export type MediaRecommendationsQueryResult = UseQueryResult<
  MovieSimilarResponse | TvSeriesRecommendationsResponse,
  TMDBError
>

export const useMediaRecommendations = (
  mediaType: MediaType,
  contentId: number
): MediaRecommendationsQueryResult => {
  const query =
    mediaType === 'tv' ? useTVRecommendations : useMovieRecommendations
  return query(contentId) as MediaRecommendationsQueryResult
}
