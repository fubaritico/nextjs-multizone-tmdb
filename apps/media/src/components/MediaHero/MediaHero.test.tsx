import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieCredits,
  mockMovieDetails,
  mockTVSeriesDetails,
  movieCreditsHandlers,
  movieDetailsHandlers,
  tvSeriesDetailsHandlers,
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

import MediaHero from './MediaHero'

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

describe('MediaHero', () => {
  it('renders the movie title', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText(mockMovieDetails.title ?? '')).toBeInTheDocument()
    })
  })

  it('renders the tagline', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(
        screen.getByText(mockMovieDetails.tagline ?? '')
      ).toBeInTheDocument()
    })
  })

  it('renders the release year', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    const year = new Date(mockMovieDetails.release_date ?? '')
      .getFullYear()
      .toString()

    await waitFor(() => {
      expect(screen.getByText(year)).toBeInTheDocument()
    })
  })

  it('renders genre badges', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    await waitFor(() => {
      for (const genre of mockMovieDetails.genres ?? []) {
        expect(screen.getByText(genre.name ?? '')).toBeInTheDocument()
      }
    })
  })

  it('renders the runtime', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('2h 22m')).toBeInTheDocument()
    })
  })

  it('shows skeleton loading state', () => {
    server.use(movieDetailsHandlers.movieDetailsLoading)

    const { container } = renderWithReactQuery(
      <MediaHero id={278} mediaType="movie" />
    )

    expect(container.querySelector('.mda\\:hero-height')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    server.use(movieDetailsHandlers.movieDetailsError)

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load media details')
      ).toBeInTheDocument()
    })
  })

  it('renders TV series title', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    renderWithReactQuery(<MediaHero id={549} mediaType="tv" />)

    await waitFor(() => {
      expect(
        screen.getByText(mockTVSeriesDetails.name ?? '')
      ).toBeInTheDocument()
    })
  })

  it('renders season count for TV series', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    renderWithReactQuery(<MediaHero id={549} mediaType="tv" />)

    const seasons = mockTVSeriesDetails.number_of_seasons ?? 0
    const label = `${String(seasons)} Season${seasons > 1 ? 's' : ''}`

    await waitFor(() => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders episode count for TV series', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    renderWithReactQuery(<MediaHero id={549} mediaType="tv" />)

    const episodes = mockTVSeriesDetails.number_of_episodes ?? 0
    const label = `${String(episodes)} Episode${episodes > 1 ? 's' : ''}`

    await waitFor(() => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders the director name and role label', async () => {
    server.use(
      movieDetailsHandlers.movieDetails,
      movieCreditsHandlers.movieCredits
    )

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    const director = mockMovieCredits.crew?.find((c) => c.job === 'Director')

    await waitFor(() => {
      expect(
        screen.getAllByText(director?.name ?? '').length
      ).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Director')).toBeInTheDocument()
    })
  })

  it('renders writer roles', async () => {
    server.use(
      movieDetailsHandlers.movieDetails,
      movieCreditsHandlers.movieCredits
    )

    renderWithReactQuery(<MediaHero id={278} mediaType="movie" />)

    const writers = mockMovieCredits.crew
      ?.filter((c) => c.department === 'Writing')
      .slice(0, 2)

    await waitFor(() => {
      for (const writer of writers ?? []) {
        expect(screen.getByText(writer.job ?? '')).toBeInTheDocument()
      }
    })
  })
})
