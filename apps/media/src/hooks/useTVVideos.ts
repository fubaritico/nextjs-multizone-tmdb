import { tvSeriesVideosOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type {
  TMDBError,
  TvSeriesVideosResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTVVideos = (seriesId: number) => {
  return useQuery({
    ...tvSeriesVideosOptions({ path: { series_id: seriesId } }),
  }) as UseQueryResult<TvSeriesVideosResponse, TMDBError>
}
