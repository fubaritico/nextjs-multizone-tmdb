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

import Crew from './Crew'

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

const director = mockMovieCredits.crew?.find((c) => c.job === 'Director')
const writers = mockMovieCredits.crew?.filter((c) => c.department === 'Writing')

describe('Crew', () => {
  it('renders the section heading', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Crew id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Crew')).toBeInTheDocument()
    })
  })

  it('renders the director name', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Crew id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getAllByText(director?.name ?? '').length).toBeGreaterThan(
        0
      )
    })
  })

  it('renders the Director role label', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Crew id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Director')).toBeInTheDocument()
    })
  })

  it('renders writer names', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<Crew id={278} mediaType="movie" />)

    await waitFor(() => {
      for (const writer of writers?.slice(0, 2) ?? []) {
        expect(screen.getByText(writer.job ?? '')).toBeInTheDocument()
      }
    })
  })

  it('shows skeleton loading state', () => {
    server.use(movieCreditsHandlers.movieCreditsLoading)

    renderWithReactQuery(<Crew id={278} mediaType="movie" />)

    expect(screen.getByTestId('crew')).toBeInTheDocument()
    expect(screen.getByText('Crew')).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(movieCreditsHandlers.movieCreditsError)

    const { container } = renderWithReactQuery(
      <Crew id={278} mediaType="movie" />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="crew"]')
      ).not.toBeInTheDocument()
    })
  })
})
