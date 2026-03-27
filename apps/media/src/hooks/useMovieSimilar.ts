import { movieSimilarOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type { MovieSimilarResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useMovieSimilar = (movieId: number) => {
  return useQuery({
    ...movieSimilarOptions({ path: { movie_id: movieId } }),
  }) as UseQueryResult<MovieSimilarResponse, TMDBError>
}
