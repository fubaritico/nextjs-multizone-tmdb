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

import MovieSynopsis from './MovieSynopsis'

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

const MOVIE_ID = mockMovieDetails.id ?? 278

describe('MovieSynopsis', () => {
  it('renders the section heading', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MovieSynopsis id={MOVIE_ID} />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Synopsis' })
      ).toBeInTheDocument()
    })
  })

  it('renders the movie overview text', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MovieSynopsis id={MOVIE_ID} />)

    await waitFor(() => {
      expect(
        screen.getByText(mockMovieDetails.overview ?? '')
      ).toBeInTheDocument()
    })
  })

  it('renders with data-testid="synopsis"', async () => {
    server.use(movieDetailsHandlers.movieDetails)

    renderWithReactQuery(<MovieSynopsis id={MOVIE_ID} />)

    await waitFor(() => {
      expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    })
  })

  it('renders loading skeletons while fetching', () => {
    server.use(movieDetailsHandlers.movieDetailsLoading)

    renderWithReactQuery(<MovieSynopsis id={MOVIE_ID} />)

    expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Synopsis' })
    ).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(movieDetailsHandlers.movieDetailsError)

    const { container } = renderWithReactQuery(<MovieSynopsis id={MOVIE_ID} />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
