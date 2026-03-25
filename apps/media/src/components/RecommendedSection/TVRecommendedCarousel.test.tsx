import { screen, waitFor } from '@testing-library/react'
import {
  mockTVSeriesRecommendations,
  tvSeriesRecommendationsHandlers,
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

import TVRecommendedCarousel from './TVRecommendedCarousel'

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

const firstSeries = mockTVSeriesRecommendations.results?.[0]
const secondSeries = mockTVSeriesRecommendations.results?.[1]

describe('TVRecommendedCarousel', () => {
  it('renders TV series names from mock data', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<TVRecommendedCarousel id={1396} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstSeries?.name ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders multiple TV series names', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<TVRecommendedCarousel id={1396} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstSeries?.name ?? 'Unknown')
      ).toBeInTheDocument()
      expect(
        screen.getByText(secondSeries?.name ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders links to TV show pages', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<TVRecommendedCarousel id={1396} />)

    await waitFor(() => {
      const firstLink = screen.getAllByRole('link')[0]
      expect(firstLink).toHaveAttribute(
        'href',
        `/tv/${String(firstSeries?.id)}`
      )
    })
  })

  it('renders the section heading', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<TVRecommendedCarousel id={1396} />)

    await waitFor(() => {
      expect(screen.getByText('Recommended')).toBeInTheDocument()
    })
  })

  it('renders the section with correct data-testid', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<TVRecommendedCarousel id={1396} />)

    await waitFor(() => {
      expect(screen.getByTestId('recommended-section')).toBeInTheDocument()
    })
  })

  it('renders loading state while fetching', () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendationsLoading)

    const { container } = renderWithReactQuery(
      <TVRecommendedCarousel id={1396} />
    )

    // CarouselLoading renders skeleton placeholders — section is not present yet
    expect(
      container.querySelector('[data-testid="recommended-section"]')
    ).toBeNull()
  })

  it('renders nothing on error', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendationsError)

    const { container } = renderWithReactQuery(
      <TVRecommendedCarousel id={1396} />
    )

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="recommended-section"]')
      ).toBeNull()
    })
  })
})
