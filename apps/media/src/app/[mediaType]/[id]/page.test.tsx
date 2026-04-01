import {
  movieCreditsOptions,
  movieDetailsOptions,
  movieImagesOptions,
  movieRecommendationsOptions,
  movieSimilarOptions,
  movieVideosOptions,
  tvSeriesCreditsOptions,
  tvSeriesDetailsOptions,
  tvSeriesImagesOptions,
  tvSeriesRecommendationsOptions,
  tvSeriesSimilarOptions,
  tvSeriesVideosOptions,
} from '@fubar-it-co/tmdb-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const prefetchQuery = vi.fn().mockResolvedValue(undefined)

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    QueryClient: vi.fn().mockImplementation(() => ({
      prefetchQuery,
      getDefaultOptions: vi.fn().mockReturnValue({}),
      getQueryData: vi.fn().mockReturnValue(undefined),
    })),
    dehydrate: vi.fn().mockReturnValue({}),
    HydrationBoundary: ({ children }: { children: React.JSX.Element }) => (
      <>{children}</>
    ),
  }
})

vi.mock('@/lib/blur', () => ({
  getBlurDataURL: vi.fn().mockResolvedValue(undefined),
}))

const mockNotFound = vi.fn()
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
}))

import MediaPage, { generateMetadata } from './page'

/** Extract queryKeys from all prefetchQuery calls. */
function getPrefetchedKeys() {
  return (prefetchQuery.mock.calls as [{ queryKey: unknown[] }][]).map(
    (call) => call[0].queryKey
  )
}

describe('MediaPage', () => {
  beforeEach(() => {
    prefetchQuery.mockClear()
    mockNotFound.mockClear()
  })

  describe('movie prefetch', () => {
    it('prefetches all 6 movie queries in parallel', async () => {
      const movieId = 278
      const path = { movie_id: movieId }

      await MediaPage({
        params: Promise.resolve({ mediaType: 'movie', id: String(movieId) }),
      })

      expect(prefetchQuery).toHaveBeenCalledTimes(6)

      const keys = getPrefetchedKeys()
      expect(keys).toContainEqual(movieDetailsOptions({ path }).queryKey)
      expect(keys).toContainEqual(movieCreditsOptions({ path }).queryKey)
      expect(keys).toContainEqual(movieSimilarOptions({ path }).queryKey)
      expect(keys).toContainEqual(
        movieRecommendationsOptions({ path }).queryKey
      )
      expect(keys).toContainEqual(movieVideosOptions({ path }).queryKey)
      expect(keys).toContainEqual(movieImagesOptions({ path }).queryKey)
    })
  })

  describe('tv prefetch', () => {
    it('prefetches all 6 tv queries in parallel', async () => {
      const seriesId = 1396
      const path = { series_id: seriesId }

      await MediaPage({
        params: Promise.resolve({ mediaType: 'tv', id: String(seriesId) }),
      })

      expect(prefetchQuery).toHaveBeenCalledTimes(6)

      const keys = getPrefetchedKeys()
      expect(keys).toContainEqual(tvSeriesDetailsOptions({ path }).queryKey)
      expect(keys).toContainEqual(tvSeriesCreditsOptions({ path }).queryKey)
      expect(keys).toContainEqual(
        tvSeriesSimilarOptions({ path: { series_id: String(seriesId) } })
          .queryKey
      )
      expect(keys).toContainEqual(
        tvSeriesRecommendationsOptions({ path }).queryKey
      )
      expect(keys).toContainEqual(tvSeriesVideosOptions({ path }).queryKey)
      expect(keys).toContainEqual(tvSeriesImagesOptions({ path }).queryKey)
    })
  })

  describe('invalid mediaType', () => {
    it('calls notFound for invalid mediaType', async () => {
      await expect(
        MediaPage({
          params: Promise.resolve({ mediaType: 'invalid', id: '123' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND')

      expect(mockNotFound).toHaveBeenCalled()
      expect(prefetchQuery).not.toHaveBeenCalled()
    })
  })

  describe('generateMetadata', () => {
    it('returns fallback title for invalid mediaType', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ mediaType: 'invalid', id: '123' }),
      })

      expect(meta.title).toBe('Not Found | TMDB')
    })

    it('prefetches details for movie metadata', async () => {
      await generateMetadata({
        params: Promise.resolve({ mediaType: 'movie', id: '278' }),
      })

      expect(prefetchQuery).toHaveBeenCalled()
    })
  })
})
