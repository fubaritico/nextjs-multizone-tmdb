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

import Photos from './Photos'

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

describe('Photos', () => {
  it('renders the section heading', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<Photos id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByText('Photos')).toBeInTheDocument()
    })
  })

  it('renders up to 4 photo links', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<Photos id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByLabelText('View photo 1')).toBeInTheDocument()
    })

    const photoCount = Math.min(4, (mockMovieImages.backdrops ?? []).length)
    for (let i = 1; i <= photoCount; i++) {
      expect(
        screen.getByLabelText(`View photo ${String(i)}`)
      ).toBeInTheDocument()
    }
  })

  it('renders the CTA tile with total photo count', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<Photos id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(
        screen.getByText(
          `${String((mockMovieImages.backdrops ?? []).length)} photos`
        )
      ).toBeInTheDocument()
    })
  })

  it('renders "View all" link with correct aria-label', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<Photos id={278} mediaType="movie" />)

    const total = (mockMovieImages.backdrops ?? []).length

    await waitFor(() => {
      expect(
        screen.getByLabelText(`View all ${String(total)} photos`)
      ).toBeInTheDocument()
    })
  })

  it('links to correct photo viewer paths', async () => {
    server.use(movieImagesHandlers.movieImages)

    renderWithReactQuery(<Photos id={278} mediaType="movie" />)

    await waitFor(() => {
      expect(screen.getByLabelText('View photo 1')).toBeInTheDocument()
    })

    const firstLink = screen.getByLabelText('View photo 1')
    expect(firstLink).toHaveAttribute(
      'href',
      expect.stringContaining('/movie/278/photos/')
    )
  })

  it('shows skeleton loading state', () => {
    server.use(movieImagesHandlers.movieImagesLoading)

    renderWithReactQuery(<Photos id={278} mediaType="movie" />)

    expect(screen.getByTestId('photos')).toBeInTheDocument()
    expect(screen.getByText('Photos')).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(movieImagesHandlers.movieImagesError)

    const { container } = renderWithReactQuery(
      <Photos id={278} mediaType="movie" />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="photos"]')
      ).not.toBeInTheDocument()
    })
  })
})
