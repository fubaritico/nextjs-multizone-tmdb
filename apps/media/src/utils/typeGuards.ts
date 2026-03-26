import type {
  MovieDetailsResponse,
  TvSeriesDetailsResponse,
} from '@fubar-it-co/tmdb-client'

/**
 * Type guard to check if media is a Movie.
 *
 * @param media - Media details (Movie or TV Series).
 * @returns `true` if media is {@link MovieDetailsResponse}.
 */
export function isMovie(
  media: MovieDetailsResponse | TvSeriesDetailsResponse
): media is MovieDetailsResponse {
  return 'title' in media
}
