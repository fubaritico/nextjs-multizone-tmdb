import { renderHook, waitFor } from '@testing-library/react'
import {
  mockMovieSimilar,
  mockTVSeriesSimilar,
  movieSimilarHandlers,
  tvSeriesSimilarHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { ReactQueryWrapper } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useMediaSimilar } from './useMediaSimilar'
import { useMovieSimilar } from './useMovieSimilar'
import { useTVSimilar } from './useTVSimilar'

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

describe('useMovieSimilar', () => {
  it('fetches similar movies', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    const { result } = renderHook(() => useMovieSimilar(278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results?.[0]?.title).toBe(
      mockMovieSimilar.results?.[0]?.title
    )
  })
})

describe('useTVSimilar', () => {
  it('fetches similar TV series', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    const { result } = renderHook(() => useTVSimilar(549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results?.[0]?.name).toBe(
      mockTVSeriesSimilar.results?.[0]?.name
    )
  })
})

describe('useMediaSimilar', () => {
  it('returns similar movies when mediaType is movie', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    const { result } = renderHook(() => useMediaSimilar('movie', 278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results).toBeDefined()
  })

  it('returns similar TV series when mediaType is tv', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    const { result } = renderHook(() => useMediaSimilar('tv', 549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results).toBeDefined()
  })
})
