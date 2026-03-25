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

import MovieCrew from './MovieCrew'

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

const MOVIE_ID = mockMovieCredits.id ?? 278

/** Crew members that should appear: Director + Writing department. */
const relevantCrew =
  mockMovieCredits.crew?.filter(
    (m) =>
      (m.department === 'Directing' && m.job === 'Director') ||
      m.department === 'Writing'
  ) ?? []

describe('MovieCrew', () => {
  it('renders the section heading', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCrew id={MOVIE_ID} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Crew' })).toBeInTheDocument()
    })
  })

  it('renders with data-testid="crew"', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCrew id={MOVIE_ID} />)

    await waitFor(() => {
      expect(screen.getByTestId('crew')).toBeInTheDocument()
    })
  })

  it('renders director name', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCrew id={MOVIE_ID} />)

    const director = relevantCrew.find((m) => m.job === 'Director')

    await waitFor(() => {
      // Director may appear multiple times if they also have a Writing credit
      const matches = screen.getAllByText(director?.name ?? '')
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  it('renders writing credits', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCrew id={MOVIE_ID} />)

    const writingCredits = relevantCrew.filter(
      (m) => m.department === 'Writing'
    )

    await waitFor(() => {
      for (const member of writingCredits) {
        expect(screen.getByText(member.job ?? '')).toBeInTheDocument()
      }
    })
  })

  it('renders loading skeletons while fetching', () => {
    server.use(movieCreditsHandlers.movieCreditsLoading)

    renderWithReactQuery(<MovieCrew id={MOVIE_ID} />)

    expect(screen.getByTestId('crew')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Crew' })).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(movieCreditsHandlers.movieCreditsError)

    const { container } = renderWithReactQuery(<MovieCrew id={MOVIE_ID} />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
