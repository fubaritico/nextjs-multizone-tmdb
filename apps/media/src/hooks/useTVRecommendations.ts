import { tvSeriesRecommendationsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type {
  TMDBError,
  TvSeriesRecommendationsResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTVRecommendations = (seriesId: number) => {
  return useQuery({
    ...tvSeriesRecommendationsOptions({ path: { series_id: seriesId } }),
  }) as UseQueryResult<TvSeriesRecommendationsResponse, TMDBError>
}
