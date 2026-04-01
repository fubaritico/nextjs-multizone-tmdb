import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieDetails,
  movieDetailsHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import Synopsis from './Synopsis'

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

describe('Synopsis', () => {
  it('renders the overview text', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<Synopsis id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(
        screen.getByText(mockMovieDetails.overview ?? '')
      ).toBeInTheDocument()
    })
  })

  it('renders the section heading', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<Synopsis id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Synopsis')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton while fetching', () => {
    server.use(movieDetailsHandlers.movieDetailsLoading)

    renderWithReactQuery(<Synopsis id={278} mediaType="movie" />)

    expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })
})
