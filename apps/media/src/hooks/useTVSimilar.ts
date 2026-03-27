import { tvSeriesSimilarOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type {
  TMDBError,
  TvSeriesSimilarResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTVSimilar = (seriesId: number) => {
  return useQuery({
    ...tvSeriesSimilarOptions({ path: { series_id: String(seriesId) } }),
  }) as UseQueryResult<TvSeriesSimilarResponse, TMDBError>
}
