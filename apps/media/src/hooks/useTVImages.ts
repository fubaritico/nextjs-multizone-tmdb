import { tvSeriesImagesOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type {
  TMDBError,
  TvSeriesImagesResponse,
} from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTVImages = (seriesId: number) => {
  return useQuery({
    ...tvSeriesImagesOptions({ path: { series_id: seriesId } }),
  }) as UseQueryResult<TvSeriesImagesResponse, TMDBError>
}
