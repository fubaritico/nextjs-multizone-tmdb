/**
 * Zone-wide type definitions and cache constants for the media zone.
 *
 * All time-sensitive constants must be imported from here — never hardcoded
 * inline. Both `revalidate` (Next.js ISR) and `staleTime` (TanStack Query)
 * must reference these values to stay aligned.
 */

/** Supported media types for the media zone. */
export type MediaType = 'movie' | 'tv'

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

/**
 * Derives a URL-safe photo id from a TMDB file_path.
 * Strips leading slash and file extension (e.g. "/abc123.jpg" → "abc123").
 */
export const toPhotoId = (filePath: string): string =>
  filePath.replace(/^\//, '').replace(/\.[^/.]+$/, '')
