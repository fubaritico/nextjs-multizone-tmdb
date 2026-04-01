import { screen, waitFor } from '@testing-library/react'
import {
  mockNowPlayingMovies,
  nowPlayingHandlers,
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

import HeroSection from './HeroSection'

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

const movies = mockNowPlayingMovies.results ?? []
const firstMovie = movies[0]
const firstTitle = firstMovie.title ?? ''
const firstOverview = firstMovie.overview ?? ''
const firstId = firstMovie.id ?? 0

describe('HeroSection', () => {
  it('renders the first now-playing movie title', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      expect(screen.getByText(firstTitle)).toBeInTheDocument()
    })
  })

  it('shows loading skeleton while fetching', () => {
    server.use(nowPlayingHandlers.nowPlayingMoviesLoading)

    renderWithReactQuery(<HeroSection />)

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('shows error message on fetch failure', async () => {
    server.use(nowPlayingHandlers.nowPlayingMoviesError)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      expect(screen.getByTestId('carousel-error')).toBeInTheDocument()
    })
  })

  it('renders the movie overview text', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      expect(screen.getByText(firstOverview)).toBeInTheDocument()
    })
  })

  it('renders a link wrapping each slide to the movie detail page', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      const firstLink = links.find(
        (link) => link.getAttribute('href') === `/movie/${String(firstId)}`
      )
      expect(firstLink).toBeInTheDocument()
    })
  })

  it('renders 6 carousel slides', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      for (const movie of movies) {
        expect(screen.getByText(movie.title ?? 'Unknown')).toBeInTheDocument()
      }
    })
  })
})
