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

import MovieCastCarousel from './MovieCastCarousel'

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

const firstCastMember = mockMovieCredits.cast?.[0]
const secondCastMember = mockMovieCredits.cast?.[1]

describe('MovieCastCarousel', () => {
  it('renders cast member names from mock data', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstCastMember?.name ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders character name for cast members', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstCastMember?.character ?? '')
      ).toBeInTheDocument()
    })
  })

  it('renders multiple cast members', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstCastMember?.name ?? 'Unknown')
      ).toBeInTheDocument()
      expect(
        screen.getByText(secondCastMember?.name ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders links to actor pages', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      const actorLink = screen.getAllByRole('link')[0]
      expect(actorLink).toHaveAttribute(
        'href',
        `/actor/${String(firstCastMember?.id)}`
      )
    })
  })

  it('renders the cast section heading', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByText('Cast')).toBeInTheDocument()
    })
  })

  it('renders the cast section with correct data-testid', async () => {
    server.use(movieCreditsHandlers.movieCredits)

    renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      expect(screen.getByTestId('cast-section')).toBeInTheDocument()
    })
  })

  it('renders loading state while fetching', () => {
    server.use(movieCreditsHandlers.movieCreditsLoading)

    const { container } = renderWithReactQuery(<MovieCastCarousel id={278} />)

    // CarouselLoading renders skeleton placeholders — section is not present yet
    expect(container.querySelector('[data-testid="cast-section"]')).toBeNull()
  })

  it('renders nothing on error', async () => {
    server.use(movieCreditsHandlers.movieCreditsError)

    const { container } = renderWithReactQuery(<MovieCastCarousel id={278} />)

    await waitFor(() => {
      expect(container.querySelector('[data-testid="cast-section"]')).toBeNull()
    })
  })
})
