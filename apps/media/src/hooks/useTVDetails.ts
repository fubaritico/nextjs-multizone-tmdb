import { tvSeriesDetailsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type {
  TMDBError,
  TvSeriesDetailsResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTVDetails = (seriesId: number) => {
  return useQuery({
    ...tvSeriesDetailsOptions({ path: { series_id: seriesId } }),
  }) as UseQueryResult<TvSeriesDetailsResponse, TMDBError>
}
