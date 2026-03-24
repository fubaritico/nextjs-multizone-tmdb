/**
 * Zone-wide type definitions and cache constants for the home zone.
 *
 * All time-sensitive constants must be imported from here — never hardcoded
 * inline. Both `revalidate` (Next.js ISR) and `staleTime` (TanStack Query)
 * must reference these values to stay aligned.
 */

/** Time window for trending queries. */
export type TimeWindow = 'day' | 'week'

/** Media type for popular / free-to-watch tabs. */
export type MediaType = 'movie' | 'tv'

/** Default time window shown on initial render of TrendingSection. */
export const DEFAULT_TRENDING_TIME_WINDOW: TimeWindow = 'day'

/** Default media type shown on initial render of PopularSection. */
export const DEFAULT_POPULAR_MEDIA_TYPE: MediaType = 'movie'

/** Default media type shown on initial render of FreeToWatchSection. */
export const DEFAULT_FREE_TO_WATCH_MEDIA_TYPE: MediaType = 'movie'

/**
 * Cache TTL in seconds — used for Next.js ISR `revalidate`.
 * Keep in sync with {@link CACHE_TIME_MS}.
 */
export const CACHE_TIME_S = 86400

/**
 * Cache TTL in milliseconds — used for TanStack Query `staleTime`.
 * Keep in sync with {@link CACHE_TIME_S}.
 */
export const CACHE_TIME_MS = 86_400_000
