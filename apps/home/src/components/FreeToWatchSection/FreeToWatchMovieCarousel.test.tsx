import { screen, waitFor } from '@testing-library/react'
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

import FreeToWatchMovieCarousel from './FreeToWatchMovieCarousel'

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

const movies = mockFreeToWatchMovies.results ?? []
const firstMovie = movies[0]

describe('FreeToWatchMovieCarousel', () => {
  it('renders free-to-watch movie titles', async () => {
    server.use(freeToWatchHandlers.freeToWatchMovies)

    renderWithReactQuery(<FreeToWatchMovieCarousel />)

    await waitFor(() => {
      expect(
        screen.getByText(firstMovie.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders links to movie detail pages', async () => {
    server.use(freeToWatchHandlers.freeToWatchMovies)

    renderWithReactQuery(<FreeToWatchMovieCarousel />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute(
        'href',
        `/movie/${String(firstMovie.id)}`
      )
    })
  })
})
