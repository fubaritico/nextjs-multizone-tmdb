import { renderHook, waitFor } from '@testing-library/react'
import {
  mockMovieDetails,
  mockTVSeriesDetails,
  movieDetailsHandlers,
  tvSeriesDetailsHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { ReactQueryWrapper } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useMediaDetails } from './useMediaDetails'
import { useMovieDetails } from './useMovieDetails'
import { useTVDetails } from './useTVDetails'

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

describe('useMovieDetails', () => {
  it('fetches movie details', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    const { result } = renderHook(() => useMovieDetails(278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.title).toBe(mockMovieDetails.title)
  })
})

describe('useTVDetails', () => {
  it('fetches TV series details', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    const { result } = renderHook(() => useTVDetails(549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.name).toBe(mockTVSeriesDetails.name)
  })
})

describe('useMediaDetails', () => {
  it('returns movie details when mediaType is movie', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    const { result } = renderHook(() => useMediaDetails('movie', 278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveProperty('title', mockMovieDetails.title)
  })

  it('returns TV details when mediaType is tv', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    const { result } = renderHook(() => useMediaDetails('tv', 549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveProperty('name', mockTVSeriesDetails.name)
  })
})
