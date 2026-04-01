import { renderHook, waitFor } from '@testing-library/react'
import {
  mockMovieImages,
  mockTVSeriesImages,
  movieImagesHandlers,
  tvSeriesImagesHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { ReactQueryWrapper } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useMediaImages } from './useMediaImages'
import { useMovieImages } from './useMovieImages'
import { useTVImages } from './useTVImages'

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('useMovieImages', () => {
  it('fetches movie images', async () => {
    server.use(movieImagesHandlers.movieImages)

    const { result } = renderHook(() => useMovieImages(278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.backdrops?.[0]?.file_path).toBe(
      mockMovieImages.backdrops?.[0]?.file_path
    )
  })
})

describe('useTVImages', () => {
  it('fetches TV series images', async () => {
    server.use(tvSeriesImagesHandlers.tvSeriesImages)

    const { result } = renderHook(() => useTVImages(549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.backdrops?.[0]?.file_path).toBe(
      mockTVSeriesImages.backdrops?.[0]?.file_path
    )
  })
})

describe('useMediaImages', () => {
  it('returns movie images when mediaType is movie', async () => {
    server.use(movieImagesHandlers.movieImages)

    const { result } = renderHook(() => useMediaImages('movie', 278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.backdrops?.[0]?.file_path).toBe(
      mockMovieImages.backdrops?.[0]?.file_path
    )
  })

  it('returns TV images when mediaType is tv', async () => {
    server.use(tvSeriesImagesHandlers.tvSeriesImages)

    const { result } = renderHook(() => useMediaImages('tv', 549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.backdrops?.[0]?.file_path).toBe(
      mockTVSeriesImages.backdrops?.[0]?.file_path
    )
  })
})
