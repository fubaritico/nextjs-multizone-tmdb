import { movieRecommendationsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type { MovieSimilarResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

// Using MovieSimilarResponse because recommendations and similar have identical
// response structures, but TMDB client types recommendations as { [key: string]: unknown }
export const useMovieRecommendations = (movieId: number) => {
  return useQuery({
    ...movieRecommendationsOptions({ path: { movie_id: movieId } }),
  }) as UseQueryResult<MovieSimilarResponse, TMDBError>
}
