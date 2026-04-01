import { renderHook, waitFor } from '@testing-library/react'
import {
  movieRecommendationsHandlers,
  tvSeriesRecommendationsHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { ReactQueryWrapper } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useMediaRecommendations } from './useMediaRecommendations'
import { useMovieRecommendations } from './useMovieRecommendations'
import { useTVRecommendations } from './useTVRecommendations'

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

describe('useMovieRecommendations', () => {
  it('fetches movie recommendations', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    const { result } = renderHook(() => useMovieRecommendations(278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results).toBeDefined()
  })
})

describe('useTVRecommendations', () => {
  it('fetches TV series recommendations', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    const { result } = renderHook(() => useTVRecommendations(549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results).toBeDefined()
  })
})

describe('useMediaRecommendations', () => {
  it('returns movie recommendations when mediaType is movie', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    const { result } = renderHook(() => useMediaRecommendations('movie', 278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results).toBeDefined()
  })

  it('returns TV recommendations when mediaType is tv', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    const { result } = renderHook(() => useMediaRecommendations('tv', 549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results).toBeDefined()
  })
})
