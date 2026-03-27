import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieRecommendations,
  movieRecommendationsHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import RecommendedMoviesCarousel from './RecommendedMoviesCarousel'

import type { MovieSimilarResponse } from '@fubar-it-co/tmdb-client'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

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

const mockData = mockMovieRecommendations as MovieSimilarResponse
const firstMovie = mockData.results?.[0]

describe('RecommendedMoviesCarousel', () => {
  it('displays movie carousel items', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<RecommendedMoviesCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText(String(firstMovie?.title))).toBeInTheDocument()
    })
  })

  it('renders loading skeleton when data is loading', () => {
    server.use(movieRecommendationsHandlers.movieRecommendationsLoading)

    const { container } = renderWithReactQuery(
      <RecommendedMoviesCarousel id={278} />
    )

    const skeletons = container.querySelectorAll('.ui-skeleton-shimmer')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error message on error', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendationsError)

    renderWithReactQuery(<RecommendedMoviesCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    })
  })

  it('creates correct link URLs for movies', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<RecommendedMoviesCarousel id={278} />)

    await waitFor(() => {
      const card = screen.getByTestId(`movie-card-${String(firstMovie?.id)}`)
      const link = card.closest('a')
      expect(link).toHaveAttribute('href', `/movie/${String(firstMovie?.id)}`)
    })
  })
})
