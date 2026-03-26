import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieDetails,
  movieDetailsHandlers,
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
})
