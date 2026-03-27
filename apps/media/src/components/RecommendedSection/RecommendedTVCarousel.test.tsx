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

import RecommendedTVCarousel from './RecommendedTVCarousel'

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

const firstShow = mockTVSeriesRecommendations.results?.[0]

describe('RecommendedTVCarousel', () => {
  it('displays TV show carousel items', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<RecommendedTVCarousel id={1396} />)

    await waitFor(() => {
      expect(screen.getByText(String(firstShow?.name))).toBeInTheDocument()
    })
  })

  it('renders loading skeleton when data is loading', () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendationsLoading)

    const { container } = renderWithReactQuery(
      <RecommendedTVCarousel id={1396} />
    )

    const skeletons = container.querySelectorAll('.ui-skeleton-shimmer')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error message on error', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendationsError)

    renderWithReactQuery(<RecommendedTVCarousel id={1396} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    })
  })

  it('creates correct link URLs for TV shows', async () => {
    server.use(tvSeriesRecommendationsHandlers.tvSeriesRecommendations)

    renderWithReactQuery(<RecommendedTVCarousel id={1396} />)

    await waitFor(() => {
      const link = screen.getByRole('link', {
        name: new RegExp(String(firstShow?.name)),
      })
      expect(link).toHaveAttribute('href', `/tv/${String(firstShow?.id)}`)
    })
  })
})
