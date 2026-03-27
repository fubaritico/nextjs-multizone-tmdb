import { movieVideosOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'

import type { MovieVideosResponse, TMDBError } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

export const useMovieVideos = (movieId: number) => {
  return useQuery({
    ...movieVideosOptions({ path: { movie_id: movieId } }),
  }) as UseQueryResult<MovieVideosResponse, TMDBError>
}
