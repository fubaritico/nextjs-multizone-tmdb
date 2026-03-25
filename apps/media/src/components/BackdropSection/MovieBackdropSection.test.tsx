import { screen, waitFor } from '@testing-library/react'
import {
  mockMovieImages,
  movieImagesHandlers,
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

import MovieBackdropSection from './MovieBackdropSection'

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

describe('MovieBackdropSection', () => {
  it('renders the Photos heading', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<MovieBackdropSection id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Photos')).toBeInTheDocument()
    })
  })

  it('renders the section with correct data-testid', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<MovieBackdropSection id={278} />)

    await waitFor(() => {
      expect(screen.getByTestId('photos')).toBeInTheDocument()
    })
  })

  it('renders up to 4 backdrop images', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<MovieBackdropSection id={278} />)

    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(4)
    })
  })

  it('renders links with correct href for each backdrop', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<MovieBackdropSection id={278} />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/movie/278/photos/0')
      expect(links[1]).toHaveAttribute('href', '/movie/278/photos/1')
      expect(links[2]).toHaveAttribute('href', '/movie/278/photos/2')
      expect(links[3]).toHaveAttribute('href', '/movie/278/photos/3')
    })
  })

  it('renders images with correct TMDB src URL', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<MovieBackdropSection id={278} />)

    const firstFilePath = mockMovieImages.backdrops?.[0]?.file_path ?? ''

    await waitFor(() => {
      const firstImage = screen.getAllByRole('img')[0]
      expect(firstImage).toHaveAttribute(
        'src',
        `https://image.tmdb.org/t/p/w780${firstFilePath}`
      )
    })
  })

  it('renders loading state (skeleton placeholders) while fetching', () => {
    server.use(movieImagesHandlers.movieImagesLoading)

    renderWithReactQuery(<MovieBackdropSection id={278} />)

    // Section still rendered with heading and skeleton during loading
    expect(screen.getByTestId('photos')).toBeInTheDocument()
    expect(screen.getByText('Photos')).toBeInTheDocument()
    // No images yet
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  it('renders nothing on error', async () => {
    server.use(movieImagesHandlers.movieImagesError)

    const { container } = renderWithReactQuery(
      <MovieBackdropSection id={278} />
    )

    await waitFor(() => {
      expect(container.querySelector('[data-testid="photos"]')).toBeNull()
    })
  })
})
