import { movieCreditsOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type { MovieCreditsResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useMovieCredits = (movieId: number) => {
  return useQuery({
    ...movieCreditsOptions({ path: { movie_id: movieId } }),
  }) as UseQueryResult<MovieCreditsResponse, TMDBError>
}
