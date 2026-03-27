import { renderHook, waitFor } from '@testing-library/react'
import {
  mockMovieCredits,
  mockTVSeriesCredits,
  movieCreditsHandlers,
  tvSeriesCreditsHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { ReactQueryWrapper } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useMediaCredits } from './useMediaCredits'
import { useMovieCredits } from './useMovieCredits'
import { useTVCredits } from './useTVCredits'

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

describe('useMovieCredits', () => {
  it('fetches movie credits', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    const { result } = renderHook(() => useMovieCredits(278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.cast?.[0]?.name).toBe(
      mockMovieCredits.cast?.[0]?.name
    )
  })
})

describe('useTVCredits', () => {
  it('fetches TV series credits', async () => {
    server.use(tvSeriesCreditsHandlers.tvSeriesCredits)

    const { result } = renderHook(() => useTVCredits(549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.cast?.[0]?.name).toBe(
      mockTVSeriesCredits.cast?.[0]?.name
    )
  })
})

describe('useMediaCredits', () => {
  it('returns movie credits when mediaType is movie', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    const { result } = renderHook(() => useMediaCredits('movie', 278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.cast?.[0]?.name).toBe(
      mockMovieCredits.cast?.[0]?.name
    )
  })

  it('returns TV credits when mediaType is tv', async () => {
    server.use(tvSeriesCreditsHandlers.tvSeriesCredits)

    const { result } = renderHook(() => useMediaCredits('tv', 549), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.cast?.[0]?.name).toBe(
      mockTVSeriesCredits.cast?.[0]?.name
    )
  })
})
