import { movieDetailsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type { MovieDetailsResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useMovieDetails = (movieId: number) => {
  return useQuery({
    ...movieDetailsOptions({ path: { movie_id: movieId } }),
  }) as UseQueryResult<MovieDetailsResponse, TMDBError>
}
