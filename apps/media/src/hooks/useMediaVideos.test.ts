import { renderHook, waitFor } from '@testing-library/react'
import {
  mockMovieVideos,
  movieVideosHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { ReactQueryWrapper } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { useMediaVideos } from './useMediaVideos'
import { useMovieVideos } from './useMovieVideos'

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

describe('useMovieVideos', () => {
  it('fetches movie videos', async () => {
    server.use(movieVideosHandlers.movieVideos)

    const { result } = renderHook(() => useMovieVideos(278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results?.[0]?.key).toBe(
      mockMovieVideos.results?.[0]?.key
    )
  })
})

describe('useMediaVideos', () => {
  it('returns movie videos when mediaType is movie', async () => {
    server.use(movieVideosHandlers.movieVideos)

    const { result } = renderHook(() => useMediaVideos('movie', 278), {
      wrapper: ReactQueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.results?.[0]?.key).toBe(
      mockMovieVideos.results?.[0]?.key
    )
  })
})
