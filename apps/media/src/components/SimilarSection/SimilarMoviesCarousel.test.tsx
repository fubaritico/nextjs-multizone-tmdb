import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieSimilar,
  movieSimilarHandlers,
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

import SimilarMoviesCarousel from './SimilarMoviesCarousel'

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

const firstMovie = mockMovieSimilar.results?.[0]

describe('SimilarMoviesCarousel', () => {
  it('displays movie carousel items', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<SimilarMoviesCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText(String(firstMovie?.title))).toBeInTheDocument()
    })
  })

  it('renders loading skeleton when data is loading', () => {
    server.use(movieSimilarHandlers.movieSimilarLoading)

    const { container } = renderWithReactQuery(
      <SimilarMoviesCarousel id={278} />
    )

    const skeletons = container.querySelectorAll('.ui-skeleton-shimmer')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error message on error', async () => {
    server.use(movieSimilarHandlers.movieSimilarError)

    renderWithReactQuery(<SimilarMoviesCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    })
  })

  it('creates correct link URLs for movies', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<SimilarMoviesCarousel id={278} />)

    await waitFor(() => {
      const link = screen.getByRole('link', {
        name: new RegExp(String(firstMovie?.title)),
      })
      expect(link).toHaveAttribute('href', `/movie/${String(firstMovie?.id)}`)
    })
  })
})
