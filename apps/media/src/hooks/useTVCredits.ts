import { tvSeriesCreditsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type {
  TMDBError,
  TvSeriesCreditsResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTVCredits = (seriesId: number) => {
  return useQuery({
    ...tvSeriesCreditsOptions({ path: { series_id: seriesId } }),
  }) as UseQueryResult<TvSeriesCreditsResponse, TMDBError>
}
