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

import MovieRecommendedCarousel from './MovieRecommendedCarousel'

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
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    <img {...props} />
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

// MovieRecommendationsResponse is typed as { [key: string]: unknown } in the generated client.
// Cast to MovieSimilarResponse (same shape) to access results with proper typing.
const typedMockRecommendations =
  mockMovieRecommendations as unknown as MovieSimilarResponse
const firstMovie = typedMockRecommendations.results?.[0]
const secondMovie = typedMockRecommendations.results?.[1]

describe('MovieRecommendedCarousel', () => {
  it('renders movie titles from mock data', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<MovieRecommendedCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstMovie?.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders multiple movie titles', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<MovieRecommendedCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstMovie?.title ?? 'Unknown')
      ).toBeInTheDocument()
      expect(
        screen.getByText(secondMovie?.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders links to movie pages', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<MovieRecommendedCarousel id={278} />)

    await waitFor(() => {
      const firstLink = screen.getAllByRole('link')[0]
      expect(firstLink).toHaveAttribute(
        'href',
        `/movie/${String(firstMovie?.id)}`
      )
    })
  })

  it('renders the section heading', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<MovieRecommendedCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Recommended')).toBeInTheDocument()
    })
  })

  it('renders the section with correct data-testid', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendations)

    renderWithReactQuery(<MovieRecommendedCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByTestId('recommended-section')).toBeInTheDocument()
    })
  })

  it('renders loading state while fetching', () => {
    server.use(movieRecommendationsHandlers.movieRecommendationsLoading)

    const { container } = renderWithReactQuery(
      <MovieRecommendedCarousel id={278} />
    )

    // CarouselLoading renders skeleton placeholders — section is not present yet
    expect(
      container.querySelector('[data-testid="recommended-section"]')
    ).toBeNull()
  })

  it('renders nothing on error', async () => {
    server.use(movieRecommendationsHandlers.movieRecommendationsError)

    const { container } = renderWithReactQuery(
      <MovieRecommendedCarousel id={278} />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="recommended-section"]')
      ).toBeNull()
    })
  })
})
