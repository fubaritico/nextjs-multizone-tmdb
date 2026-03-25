import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieSimilar,
  movieSimilarHandlers,
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

import MovieSimilarCarousel from './MovieSimilarCarousel'

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

const firstResult = mockMovieSimilar.results?.[0]
const secondResult = mockMovieSimilar.results?.[1]

describe('MovieSimilarCarousel', () => {
  it('renders movie titles from mock data', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<MovieSimilarCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstResult?.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders multiple movie titles', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<MovieSimilarCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstResult?.title ?? 'Unknown')
      ).toBeInTheDocument()
      expect(
        screen.getByText(secondResult?.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders correct href links for movies', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<MovieSimilarCarousel id={278} />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute(
        'href',
        `/movie/${String(firstResult?.id)}`
      )
    })
  })

  it('renders the section heading', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<MovieSimilarCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Similar')).toBeInTheDocument()
    })
  })

  it('renders section with correct data-testid', async () => {
    server.use(movieSimilarHandlers.movieSimilar)

    renderWithReactQuery(<MovieSimilarCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByTestId('similar-section')).toBeInTheDocument()
    })
  })

  it('renders loading state while fetching', () => {
    server.use(movieSimilarHandlers.movieSimilarLoading)

    const { container } = renderWithReactQuery(
      <MovieSimilarCarousel id={278} />
    )

    // CarouselLoading renders skeleton placeholders — section is not present yet
    expect(
      container.querySelector('[data-testid="similar-section"]')
    ).toBeNull()
  })

  it('renders nothing on error', async () => {
    server.use(movieSimilarHandlers.movieSimilarError)

    const { container } = renderWithReactQuery(
      <MovieSimilarCarousel id={278} />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="similar-section"]')
      ).toBeNull()
    })
  })
})
