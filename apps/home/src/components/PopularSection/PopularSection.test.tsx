import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockPopularMovies,
  popularHandlers,
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

import PopularSection from './PopularSection'

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

const firstMovieTitle = (mockPopularMovies.results ?? [])[0].title ?? 'Unknown'

describe('PopularSection', () => {
  it('renders the "What\'s Popular" heading', () => {
    server.use(popularHandlers.popularMovies, popularHandlers.popularTV)

    renderWithReactQuery(<PopularSection />)

    expect(screen.getByText("What's Popular")).toBeInTheDocument()
  })

  it('renders "Movies" and "TV Shows" tabs', () => {
    server.use(popularHandlers.popularMovies, popularHandlers.popularTV)

    renderWithReactQuery(<PopularSection />)

    expect(screen.getByRole('tab', { name: /movies/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tv shows/i })).toBeInTheDocument()
  })

  it('shows popular movies by default', async () => {
    server.use(popularHandlers.popularMovies, popularHandlers.popularTV)

    renderWithReactQuery(<PopularSection />)

    await waitFor(() => {
      expect(screen.getByText(firstMovieTitle)).toBeInTheDocument()
    })
  })

  it('switches to TV Shows tab on click', async () => {
    const user = userEvent.setup()
    server.use(popularHandlers.popularMovies, popularHandlers.popularTV)

    renderWithReactQuery(<PopularSection />)

    await user.click(screen.getByRole('tab', { name: /tv shows/i }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /tv shows/i })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
  })
})
