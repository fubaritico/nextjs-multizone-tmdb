import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  freeToWatchHandlers,
  mockFreeToWatchMovies,
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

import FreeToWatchSection from './FreeToWatchSection'

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

const firstMovieTitle =
  (mockFreeToWatchMovies.results ?? [])[0].title ?? 'Unknown'

describe('FreeToWatchSection', () => {
  it('renders the "Free To Watch" heading', () => {
    server.use(
      freeToWatchHandlers.freeToWatchMovies,
      freeToWatchHandlers.freeToWatchTV
    )

    renderWithReactQuery(<FreeToWatchSection />)

    expect(screen.getByText('Free To Watch')).toBeInTheDocument()
  })

  it('renders "Movies" and "TV Shows" tabs', () => {
    server.use(
      freeToWatchHandlers.freeToWatchMovies,
      freeToWatchHandlers.freeToWatchTV
    )

    renderWithReactQuery(<FreeToWatchSection />)

    expect(screen.getByRole('tab', { name: /movies/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tv shows/i })).toBeInTheDocument()
  })

  it('shows free-to-watch movies by default', async () => {
    server.use(
      freeToWatchHandlers.freeToWatchMovies,
      freeToWatchHandlers.freeToWatchTV
    )

    renderWithReactQuery(<FreeToWatchSection />)

    await waitFor(() => {
      expect(screen.getByText(firstMovieTitle)).toBeInTheDocument()
    })
  })

  it('switches to TV Shows tab on click', async () => {
    const user = userEvent.setup()
    server.use(
      freeToWatchHandlers.freeToWatchMovies,
      freeToWatchHandlers.freeToWatchTV
    )

    renderWithReactQuery(<FreeToWatchSection />)

    await user.click(screen.getByRole('tab', { name: /tv shows/i }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /tv shows/i })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
  })
})
