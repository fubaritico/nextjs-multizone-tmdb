import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieCredits,
  movieCreditsHandlers,
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

import Cast from './Cast'

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

describe('Cast', () => {
  it('renders the section heading', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Cast id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Cast')).toBeInTheDocument()
    })
  })

  it('renders cast member names from mock data', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Cast id={278} mediaType="movie" />)

    const firstActor = mockMovieCredits.cast?.[0]

    await waitFor(() => {
      expect(screen.getByText(firstActor?.name ?? '')).toBeInTheDocument()
    })
  })

  it('renders cast member characters', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Cast id={278} mediaType="movie" />)

    const firstActor = mockMovieCredits.cast?.[0]

    await waitFor(() => {
      expect(screen.getByText(firstActor?.character ?? '')).toBeInTheDocument()
    })
  })

  it('renders up to 10 cast members', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Cast id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(
        screen.getByText(mockMovieCredits.cast?.[0]?.name ?? '')
      ).toBeInTheDocument()
    })

    const cast = mockMovieCredits.cast ?? []
    const renderedNames = cast
      .slice(0, 10)
      .filter((actor) => screen.queryByText(actor.name ?? ''))

    expect(renderedNames).toHaveLength(Math.min(10, cast.length))
  })

  it('renders the "Whole cast" button', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Cast id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Whole cast')).toBeInTheDocument()
    })
  })

  it('shows skeleton loading state', () => {
    server.use(movieCreditsHandlers.movieCreditsLoading)

    renderWithReactQuery(<Cast id={278} mediaType="movie" />)

    expect(screen.getByTestId('cast-section')).toBeInTheDocument()
    expect(screen.getByText('Cast')).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(movieCreditsHandlers.movieCreditsError)

    const { container } = renderWithReactQuery(
      <Cast id={278} mediaType="movie" />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="cast-section"]')
      ).not.toBeInTheDocument()
    })
  })
})
