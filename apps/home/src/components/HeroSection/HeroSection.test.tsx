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
const firstReleaseDate = firstMovie.release_date ?? ''
const firstId = firstMovie.id ?? 0

describe('HeroSection', () => {
  it('renders the first now-playing movie title', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      expect(screen.getByText(firstTitle)).toBeInTheDocument()
    })
  })

  it('renders the movie overview text', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      expect(screen.getByText(firstOverview)).toBeInTheDocument()
    })
  })

  it('renders the release year', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    const expectedYear = new Date(firstReleaseDate).getFullYear()

    await waitFor(() => {
      const years = screen.getAllByText(String(expectedYear))
      expect(years.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders a link to the movie detail page', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /more info/i })
      expect(links[0]).toHaveAttribute('href', `/movie/${String(firstId)}`)
    })
  })

  it('renders a region landmark with "Now Playing" label', async () => {
    server.use(nowPlayingHandlers.nowPlayingMovies)

    renderWithReactQuery(<HeroSection />)

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /now playing/i })
      ).toBeInTheDocument()
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
