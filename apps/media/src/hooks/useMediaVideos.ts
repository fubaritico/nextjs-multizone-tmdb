import { useMovieVideos } from './useMovieVideos'
import { useTVVideos } from './useTVVideos'

import type { MediaType } from '@/types/media'
import type {
  MovieVideosResponse,
  TMDBError,
  TvSeriesVideosResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export type MediaVideosQueryResult =
  | UseQueryResult<MovieVideosResponse, TMDBError>
  | UseQueryResult<TvSeriesVideosResponse, TMDBError>

export function useMediaVideos(
  mediaType: MediaType,
  contentId: number
): MediaVideosQueryResult {
  const query = mediaType === 'tv' ? useTVVideos : useMovieVideos
  return query(contentId)
}
