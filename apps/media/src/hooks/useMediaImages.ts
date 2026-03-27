import { useMovieImages } from './useMovieImages'
import { useTVImages } from './useTVImages'

import type { MediaType } from '@/types/media'
import type {
  MovieImagesResponse,
  TMDBError,
  TvSeriesImagesResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export type MediaImagesQueryResult =
  | UseQueryResult<MovieImagesResponse, TMDBError>
  | UseQueryResult<TvSeriesImagesResponse, TMDBError>

export function useMediaImages(
  mediaType: MediaType,
  contentId: number
): MediaImagesQueryResult {
  const query = mediaType === 'tv' ? useTVImages : useMovieImages
  return query(contentId)
}
