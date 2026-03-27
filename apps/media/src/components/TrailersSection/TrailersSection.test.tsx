import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieVideos,
  movieVideosHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import TrailersSection from './TrailersSection'

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

const officialTrailers = (mockMovieVideos.results ?? []).filter(
  (v) =>
    v.type === 'Trailer' &&
    v.site === 'YouTube' &&
    v.official === true &&
    v.key != null
)

describe('TrailersSection', () => {
  it('renders the section heading', async () => {
    server.use(movieVideosHandlers.movieVideos)

    renderWithReactQuery(<TrailersSection id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Trailers')).toBeInTheDocument()
    })
  })

  it('renders trailer cards for official trailers', async () => {
    server.use(movieVideosHandlers.movieVideos)

    renderWithReactQuery(<TrailersSection id={278} mediaType="movie" />)

    const trailerCount = Math.min(3, officialTrailers.length)
    await waitFor(() => {
      for (let i = 0; i < trailerCount; i++) {
        expect(
          screen.getByRole('button', {
            name: new RegExp(officialTrailers[i].name ?? 'Trailer'),
          })
        ).toBeInTheDocument()
      }
    })
  })

  it('shows skeleton loading state', () => {
    server.use(movieVideosHandlers.movieVideosLoading)

    renderWithReactQuery(<TrailersSection id={278} mediaType="movie" />)

    expect(screen.getByTestId('trailers-section')).toBeInTheDocument()
    expect(screen.getByText('Trailers')).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(movieVideosHandlers.movieVideosError)

    const { container } = renderWithReactQuery(
      <TrailersSection id={278} mediaType="movie" />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="trailers-section"]')
      ).not.toBeInTheDocument()
    })
  })
})
