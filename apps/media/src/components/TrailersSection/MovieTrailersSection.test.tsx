import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockMovieVideos,
  movieVideosHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import MovieTrailersSection from './MovieTrailersSection'

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

/** The single Trailer in mockMovieVideos (type=Trailer, site=YouTube, official=true). */
const officialTrailer = mockMovieVideos.results?.find(
  (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official === true
)

describe('MovieTrailersSection', () => {
  it('renders the trailers section heading', async () => {
    server.use(movieVideosHandlers.movieVideos)

    renderWithReactQuery(<MovieTrailersSection id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Trailers')).toBeInTheDocument()
    })
  })

  it('renders trailer thumbnail with play button', async () => {
    server.use(movieVideosHandlers.movieVideos)

    renderWithReactQuery(<MovieTrailersSection id={278} />)

    await waitFor(() => {
      const playButton = screen.getByRole('button', {
        name: `Play ${officialTrailer?.name ?? 'Trailer'}`,
      })
      expect(playButton).toBeInTheDocument()
    })
  })

  it('opens modal with iframe on thumbnail click', async () => {
    const user = userEvent.setup()
    server.use(movieVideosHandlers.movieVideos)

    const { container } = renderWithReactQuery(
      <MovieTrailersSection id={278} />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: `Play ${officialTrailer?.name ?? 'Trailer'}`,
        })
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', {
        name: `Play ${officialTrailer?.name ?? 'Trailer'}`,
      })
    )

    const iframe = container.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe?.src).toBe(
      `https://www.youtube.com/embed/${officialTrailer?.key ?? ''}`
    )
  })

  it('renders the trailers section with correct data-testid', async () => {
    server.use(movieVideosHandlers.movieVideos)

    renderWithReactQuery(<MovieTrailersSection id={278} />)

    await waitFor(() => {
      expect(screen.getByTestId('trailers-section')).toBeInTheDocument()
    })
  })

  it('renders loading state while fetching', () => {
    server.use(movieVideosHandlers.movieVideosLoading)

    const { container } = renderWithReactQuery(
      <MovieTrailersSection id={278} />
    )

    expect(container.querySelector('iframe')).toBeNull()
  })

  it('renders nothing on error', async () => {
    server.use(movieVideosHandlers.movieVideosError)

    const { container } = renderWithReactQuery(
      <MovieTrailersSection id={278} />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="trailers-section"]')
      ).toBeNull()
    })
  })
})
