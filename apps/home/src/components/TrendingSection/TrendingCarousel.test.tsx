import { screen, waitFor } from '@testing-library/react'
import {
  mockTrendingDay,
  mockTrendingWeek,
  trendingHandlers,
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

import TrendingCarousel from './TrendingCarousel'

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

const dayItems = mockTrendingDay.results ?? []
const weekItems = mockTrendingWeek.results ?? []
const firstDayItem = dayItems[0]
const firstWeekItem = weekItems[0]

describe('TrendingCarousel', () => {
  it('renders trending day movie titles', async () => {
    server.use(trendingHandlers.trendingDay)

    renderWithReactQuery(<TrendingCarousel timeWindow="day" />)

    await waitFor(() => {
      expect(
        screen.getByText(firstDayItem.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders trending week movie titles', async () => {
    server.use(trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingCarousel timeWindow="week" />)

    await waitFor(() => {
      expect(
        screen.getByText(firstWeekItem.title ?? 'Unknown')
      ).toBeInTheDocument()
    })
  })

  it('renders links with correct movie/tv routes', async () => {
    server.use(trendingHandlers.trendingDay)

    renderWithReactQuery(<TrendingCarousel timeWindow="day" />)

    const mediaType = firstDayItem.media_type === 'tv' ? 'tv' : 'movie'
    const expectedPath = `/${mediaType}/${String(firstDayItem.id)}`

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', expectedPath)
    })
  })
})
