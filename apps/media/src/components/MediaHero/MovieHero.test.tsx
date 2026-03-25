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

import MovieHero from './MovieHero'

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

describe('MovieHero', () => {
  it('renders the movie title', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MovieHero id={278} />)

    await waitFor(() => {
      expect(screen.getByText(mockMovieDetails.title ?? '')).toBeInTheDocument()
    })
  })

  it('renders the release year', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MovieHero id={278} />)

    const year = mockMovieDetails.release_date
      ? new Date(mockMovieDetails.release_date).getFullYear()
      : null

    await waitFor(() => {
      if (year) {
        expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument()
      }
    })
  })

  it('renders genre badges', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MovieHero id={278} />)

    await waitFor(() => {
      for (const genre of mockMovieDetails.genres ?? []) {
        expect(screen.getByText(genre.name ?? '')).toBeInTheDocument()
      }
    })
  })

  it('renders the loading skeleton while fetching', () => {
    server.use(movieDetailsHandlers.movieDetailsLoading)

    renderWithReactQuery(<MovieHero id={278} />)

    // The skeleton is rendered immediately before data arrives
    const skeletons = document.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders an error message on API failure', async () => {
    server.use(movieDetailsHandlers.movieDetailsError)

    renderWithReactQuery(<MovieHero id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load movie details/i)
      ).toBeInTheDocument()
    })
  })
})
