import { screen, waitFor } from '@testing-library/react'
import {
  mockTVSeriesSimilar,
  tvSeriesSimilarHandlers,
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

import TVSimilarCarousel from './TVSimilarCarousel'

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

const firstResult = mockTVSeriesSimilar.results?.[0]
const secondResult = mockTVSeriesSimilar.results?.[1]

describe('TVSimilarCarousel', () => {
  it('renders TV series names from mock data', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstResult?.name ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders multiple TV series names', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    await waitFor(() => {
      expect(
        screen.getByText(firstResult?.name ?? 'Unknown')
      ).toBeInTheDocument()
      expect(
        screen.getByText(secondResult?.name ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders correct href links for TV series', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', `/tv/${String(firstResult?.id)}`)
    })
  })

  it('renders the section heading', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    await waitFor(() => {
      expect(screen.getByText('Similar')).toBeInTheDocument()
    })
  })

  it('renders section with correct data-testid', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilar)

    renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    await waitFor(() => {
      expect(screen.getByTestId('similar-section')).toBeInTheDocument()
    })
  })

  it('renders loading state while fetching', () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilarLoading)

    const { container } = renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    // CarouselLoading renders skeleton placeholders — section is not present yet
    expect(
      container.querySelector('[data-testid="similar-section"]')
    ).toBeNull()
  })

  it('renders nothing on error', async () => {
    server.use(tvSeriesSimilarHandlers.tvSeriesSimilarError)

    const { container } = renderWithReactQuery(<TVSimilarCarousel id={1396} />)

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="similar-section"]')
      ).toBeNull()
    })
  })
})
