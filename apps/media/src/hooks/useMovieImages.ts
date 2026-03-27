import { movieImagesOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type { MovieImagesResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useMovieImages = (movieId: number) => {
  return useQuery({
    ...movieImagesOptions({ path: { movie_id: movieId } }),
  }) as UseQueryResult<MovieImagesResponse, TMDBError>
}
